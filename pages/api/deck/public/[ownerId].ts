/**
 * @file /api/deck/public/[ownerId].ts
 * @description Gets a users decks based on their id.
 *
 * @author Cole de Ruiter
 * @since 2026-04-07
 */
import type { NextApiRequest, NextApiResponse } from "next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import type {
    PublicDeckListItem,
    PublicDeckSearchApiResponse,
} from "@/lib/deckTypes"

type UserInfo = {
    _id: ObjectId
    name?: string | null
    image?: string | null
    email?: string | null
}


type DeckInfo = {
    _id: ObjectId
    title?: string
    game?: string
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    cards?: Array<{ quantity?: number }>
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PublicDeckSearchApiResponse>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const { ownerId } = req.query

    if (typeof ownerId !== "string" || !ObjectId.isValid(ownerId)) {
        return res.status(400).json({ error: "Invalid owner id" })
    }

    try {
        const client = await clientPromise
        const db = client.db()
        const ownerObjectId = new ObjectId(ownerId)

        const owner = await db.collection<UserInfo>("users").findOne(
            { _id: ownerObjectId },
            { projection: { name: 1, image: 1, email: 1 } }
        )

        if (!owner) {
            return res.status(404).json({ error: "User not found" })
        }

        const decks = await db
            .collection<DeckInfo>("decks")
            .find(
                {
                    visibility: "public",
                    ownerId: ownerObjectId,
                },
                {
                    projection: {
                        title: 1,
                        game: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        cards: 1,
                    },
                }
            )
            .sort({ updatedAt: -1 })
            .toArray()

        const mappedDecks: PublicDeckListItem[] = decks.map((deck) => ({
            id: deck._id.toHexString(),
            title: deck.title ?? "Untitled Deck",
            game: deck.game ?? "unknown",
            visibility: "public",
            createdAt: deck.createdAt ? new Date(deck.createdAt).toISOString() : null,
            updatedAt: deck.updatedAt ? new Date(deck.updatedAt).toISOString() : null,
            cardCount: Array.isArray(deck.cards)
                ? deck.cards.reduce((total, card) => total + (card.quantity ?? 1), 0)
                : 0,
            authorId: ownerObjectId.toHexString(),
            authorName: owner.name ?? owner.email ?? null,
            authorImage: owner.image ?? null,
        }))

        return res.status(200).json({
            decks: mappedDecks,
            total: mappedDecks.length,
            page: 1,
            totalPages: 1,
        })
    } catch (error) {
        console.error("Failed to load public decks for owner:", error)
        return res.status(500).json({ error: "Failed to load public decks" })
    }
}