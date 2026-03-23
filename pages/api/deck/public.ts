import type { NextApiRequest, NextApiResponse } from "next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import type {
    DeckVisibility,
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
    visibility?: DeckVisibility
    createdAt?: Date | string | null
    updatedAt?: Date | string | null
    cards?: Array<{ quantity?: number }>
    userId?: string | ObjectId | null
    ownerId?: string | ObjectId | null
}

function toObjectId(value: unknown): ObjectId | null {
    if (!value) return null
    if (value instanceof ObjectId) return value
    if (typeof value === "string" && ObjectId.isValid(value)) {
        return new ObjectId(value)
    }
    return null
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PublicDeckSearchApiResponse>
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET")
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {
        const client = await clientPromise
        const db = client.db()

        const query = typeof req.query.query === "string" ? req.query.query.trim() : ""
        const game = typeof req.query.game === "string" ? req.query.game.trim() : ""
        const page = Math.max(1, Number(req.query.page) || 1)

        // pages
        const limit = 24
        const skip = (page - 1) * limit

        //for query
        const filter: Record<string, unknown> = {
            visibility: "public",
        }

        if (query) {
            filter.title = { $regex: query, $options: "i" }
        }

        if (game) {
            filter.game = game
        }

        const total = await db.collection<DeckInfo>("decks").countDocuments(filter)

        // query db
        const decks = await db
            .collection<DeckInfo>("decks")
            .find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .project({
                title: 1,
                game: 1,
                visibility: 1,
                createdAt: 1,
                updatedAt: 1,
                cards: 1,
                userId: 1,
                ownerId: 1,
            })
            .toArray()

        const userIds = Array.from(
            new Set(
                decks
                    .map((deck) => toObjectId(deck.userId ?? deck.ownerId))
                    .filter((id): id is ObjectId => id !== null)
                    .map((id) => id.toHexString())
            )
        ).map((id) => new ObjectId(id))

        const users = userIds.length
            ? await db
                .collection<UserInfo>("users")
                .find({ _id: { $in: userIds } })
                .project({ name: 1, image: 1, email: 1 })
                .toArray()
            : [] //incase no user

        const usersById = new Map(
            users.map((user) => [
                user._id.toHexString(),
                {
                    name: user.name ?? null,
                    image: user.image ?? null,
                    email: user.email ?? null,
                },
            ])
        )

        const mapped: PublicDeckListItem[] = decks.map((deck) => {
            const ownerId = toObjectId(deck.userId ?? deck.ownerId)
            const author = ownerId ? usersById.get(ownerId.toHexString()) : null

            return {
                id: String(deck._id),
                title: deck.title ?? "Untitled Deck",
                game: deck.game ?? "unknown",
                visibility: deck.visibility ?? "private",
                createdAt: deck.createdAt ? new Date(deck.createdAt).toISOString() : null,
                updatedAt: deck.updatedAt ? new Date(deck.updatedAt).toISOString() : null,
                cardCount: Array.isArray(deck.cards)
                    ? deck.cards.reduce((total, card) => total + (card.quantity ?? 1), 0)
                    : 0,
                authorName: author?.name ?? author?.email ?? null,
                authorImage: author?.image ?? null,
            }
        })

        return res.status(200).json({
            decks: mapped,
            total,
            page,
            totalPages: Math.max(1, Math.ceil(total / limit)), //pagination
        })
    } catch (error) {
        console.error("Failed to load public decks:", error)
        return res.status(500).json({ error: "Failed to load public decks" })
    }
}