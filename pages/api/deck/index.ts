/**
 * @file /api/deck
 * @description Handles user deck operations.
 * GET: Gets all decks owned by the logged in user.
 * POST: Create a new deck with validation.
 *
 * @author Cole de Ruiter
 * @since 2026-04-04
 */
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

type CreateDeckBody = {
    title?: string
    game?: string
    description?: string
    format?: string
    visibility?: "private" | "unlisted" | "public"
}

const ALLOWED_GAMES = new Set(["pokemon"])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    if (!ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid user id" })

    const client = await clientPromise
    const db = client.db()
    const ownerObjectId = new ObjectId(userId)

    if (req.method === "GET") {
        const decks = await db
            .collection("decks")
            .find({ ownerId: ownerObjectId })
            .project({ title: 1, game: 1, visibility: 1, createdAt: 1, updatedAt: 1, cards: 1 })
            .sort({ updatedAt: -1 })
            .toArray()

        return res.status(200).json({
            decks: decks.map((deck) => {
                const cards = Array.isArray((deck as any).cards) ? (deck as any).cards : []

                const cardCount = cards.reduce((total: number, card: any) => {
                    return total + Number(card?.quantity ?? 0)
                }, 0)

                return {
                    id: deck._id.toString(),
                    title: (deck as any).title ?? "",
                    game: (deck as any).game ?? "",
                    visibility: (deck as any).visibility ?? "private",
                    createdAt: (deck as any).createdAt ?? null,
                    updatedAt: (deck as any).updatedAt ?? null,
                    cardCount,
                }
            }),
        })
    }

    if (req.method === "POST") {
        const body = (req.body ?? {}) as CreateDeckBody

        const title = (body.title ?? "").trim()
        const game = (body.game ?? "").trim().toLowerCase()
        const description = (body.description ?? "").trim()
        const format = (body.format ?? "").trim()
        const visibility = (body.visibility ?? "private").trim() as CreateDeckBody["visibility"]

        if (!title) return res.status(400).json({ error: "Deck title is required" })
        if (title.length > 60) return res.status(400).json({ error: "Deck title is too long" })
        if (!game) return res.status(400).json({ error: "Game is required" })
        if (game.length > 32) return res.status(400).json({ error: "Invalid game" })
        if (!ALLOWED_GAMES.has(game)) return res.status(400).json({ error: "Unsupported game" })

        const now = new Date()

        const result = await db.collection("decks").insertOne({
            ownerId: ownerObjectId,
            title,
            game,
            description: description || null,
            format: format || null,
            visibility: visibility ?? "private",
            cards: [],
            createdAt: now,
            updatedAt: now,
        })

        return res.status(201).json({ deckId: result.insertedId.toString() })
    }

    return res.status(405).json({ error: "Method not allowed" })
}