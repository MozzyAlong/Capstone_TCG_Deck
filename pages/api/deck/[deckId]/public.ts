import type { NextApiRequest, NextApiResponse } from "next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import type { DeckDetailsApiResponse } from "@/lib/deckTypes"

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
        const client = await clientPromise
        const db = client.db()

        const deck = await db.collection("decks").findOne({
            _id: new ObjectId(deckId),
            visibility: "public",
        })

        if (!deck) {
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