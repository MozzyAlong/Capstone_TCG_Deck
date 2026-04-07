/**
 * @file /api/deck/[deckId]/public.ts
 * @description Handles public access to a deck.
 * GET: Gets a deck by id if it is public, unlisted or owned by the logged in user
 *
 * @author Cole de Ruiter
 * @since 2026-04-04
 */
import type { NextApiRequest, NextApiResponse } from "next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import type { DeckDetailsApiResponse } from "@/lib/deckTypes"
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next"

type UserInfo = {
    _id: ObjectId
    name?: string | null
    email?: string | null
}

function toObjectId(value: unknown): ObjectId | null {
    if (!value) return null
    if (value instanceof ObjectId) return value
    if (typeof value === "string" && ObjectId.isValid(value)) {
        return new ObjectId(value)
    }
    return null
}

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

        const ownerId = toObjectId(deck.ownerId)

        const author = ownerId
            ? await db.collection<UserInfo>("users").findOne(
                { _id: ownerId },
                { projection: { name: 1, email: 1 } }
            )
            : null

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
                    : 0,
                commentCount: Array.isArray(deck.comments) ? deck.comments.length : 0,
                comments: deck.comments ?? [],
                authorId: ownerId ? ownerId.toHexString() : null,
                authorName: author?.name ?? author?.email ?? null,
                likes: deck.likes ?? [],
            },
        })
    } catch (error) {
        console.error("Failed to load public deck:", error)
        return res.status(500).json({ error: "Failed to load public deck" })
    }
}