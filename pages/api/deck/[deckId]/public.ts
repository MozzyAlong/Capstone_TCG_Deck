import type { NextApiRequest, NextApiResponse } from "next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import type { DeckDetailsApiResponse } from "@/lib/deckTypes"
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next"

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeckDetailsApiResponse>) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET")
        return res.status(405).json({ error: "Method not allowed" })
    }

    const { deckId } = req.query

    if (typeof deckId !== "string" || !ObjectId.isValid(deckId)) {
        return res.status(400).json({ error: "Invalid deck id" })
    }

    try {
        const session = await getServerSession(req, res, authOptions)
        const userId = (session?.user as any)?.id as string | undefined

        const client = await clientPromise
        const db = client.db()

        const deck = await db.collection("decks").findOne({
            _id: new ObjectId(deckId),
        })

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" })
        }

        // Check if owner
        // owner can view "public" page of deck even if private
        const isOwner =
            !!userId &&
            String(deck.ownerId) === String(userId)

        const isPubliclyVisible = deck.visibility === "public" || deck.visibility === "unlisted"

        if (!isPubliclyVisible && !isOwner) {
            return res.status(404).json({ error: "Deck not found" })
        }

        return res.status(200).json({
            deck: {
                id: String(deck._id),
                title: deck.title ?? "Untitled Deck",
                game: deck.game ?? "unknown",
                visibility: deck.visibility ?? "private",
                description: deck.description ?? null,
                format: deck.format ?? null,
                createdAt: deck.createdAt ? new Date(deck.createdAt).toISOString() : null,
                updatedAt: deck.updatedAt ? new Date(deck.updatedAt).toISOString() : null,
                cards: Array.isArray(deck.cards) ? deck.cards : [],
                cardCount: Array.isArray(deck.cards)
                    ? deck.cards.reduce((total, card) => total + (card.quantity ?? 1), 0)
                    : 0
            },
        })
    } catch (error) {
        console.error("Failed to load public deck:", error)
        return res.status(500).json({ error: "Failed to load public deck" })
    }
}