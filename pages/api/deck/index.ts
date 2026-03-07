import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

type CreateDeckBody = {
    title?: string

    // TCG game starting with pokemon
    game?: string

    description?: string

    // Game formats, standard for now will decide how we handle other modes in the future
    format?: string

    // private: only the decks owner can view
    // unlisted: can be viewed if someone has a link but wont be shown on other pages
    // public: publicly available
    visibility?: "private" | "unlisted" | "public"
}

const ALLOWED_GAMES = new Set(["pokemon"])  // pokemon first, probably MTG second? havent decided

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    if (!ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid user id" })

    const client = await clientPromise
    const db = client.db()
    const ownerObjectId = new ObjectId(userId)

    // list personal decks
    if (req.method === "GET") {
        const decks = await db
            .collection("decks")
            .find({ ownerId: ownerObjectId })
            .project({ title: 1, game: 1, visibility: 1, createdAt: 1, updatedAt: 1 })
            .sort({ updatedAt: -1 })
            .toArray()

        return res.status(200).json({
            decks: decks.map((deck) => ({
                id: deck._id.toString(),
                title: (deck as any).title ?? "",
                game: (deck as any).game ?? "",
                visibility: (deck as any).visibility ?? "private",
                createdAt: (deck as any).createdAt ?? null,
                updatedAt: (deck as any).updatedAt ?? null,
            })),
        })
    }

    // decks creation
    if (req.method === "POST") {
        // body is the request body
        const body = (req.body ?? {}) as CreateDeckBody

        const title = (body.title ?? "").trim()
        const game = (body.game ?? "").trim().toLowerCase()
        const description = (body.description ?? "").trim()
        const format = (body.format ?? "").trim()
        const visibility = (body.visibility ?? "private").trim() as CreateDeckBody["visibility"]

        // fail early if any of this are true
        if (!title) return res.status(400).json({ error: "Deck title is required" })
        if (title.length > 60) return res.status(400).json({ error: "Deck title is too long" })
        if (!game) return res.status(400).json({ error: "Game is required" })
        if (game.length > 32) return res.status(400).json({ error: "Invalid game" })
        if (!ALLOWED_GAMES.has(game)) return res.status(400).json({ error: "Unsupported game" }) // just in case

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