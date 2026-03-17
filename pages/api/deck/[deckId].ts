import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

type Visibility = "private" | "unlisted" | "public"

type PatchDeckBody = {
    title?: string
    description?: string
    format?: string
    visibility?: Visibility
}

const ALLOWED_VISIBILITY = new Set<Visibility>(["private", "unlisted", "public"]) //just incase

function normalizeString(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { deckId } = req.query

    if (typeof deckId !== "string") {
        return res.status(400).json({ error: "Invalid deck id" })
    }

    if (!ObjectId.isValid(deckId)) {
        return res.status(400).json({ error: "Invalid deck id" })
    }

    const session = await getServerSession(req, res, authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
    }

    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user id" })
    }

    const client = await clientPromise
    const db = client.db()

    const deckObjectId = new ObjectId(deckId)
    const ownerObjectId = new ObjectId(userId)

    // get deck specified by id
    if (req.method === "GET") {
        const deck = await db.collection("decks").findOne({
            _id: deckObjectId,
            ownerId: ownerObjectId,
        })

        if (!deck) {
            return res.status(404).json({ error: "Deck not found" })
        }

        return res.status(200).json({
            deck: {
                id: deck._id.toString(),
                title: (deck as any).title ?? "",
                game: (deck as any).game ?? "",
                description: (deck as any).description ?? null,
                format: (deck as any).format ?? null,
                visibility: (deck as any).visibility ?? "private",
                cards: Array.isArray((deck as any).cards) ? (deck as any).cards : [],
                createdAt: (deck as any).createdAt ?? null,
                updatedAt: (deck as any).updatedAt ?? null,
            },
        })
    }

    // update deck info (not card data)
    if (req.method === "PATCH") {
        const body = (req.body ?? {}) as PatchDeckBody

        const existingDeck = await db.collection("decks").findOne({
            _id: deckObjectId,
            ownerId: ownerObjectId,
        })

        if (!existingDeck) {
            return res.status(404).json({ error: "Deck not found" })
        }

        const updateFields: Record<string, unknown> = {
            updatedAt: new Date(),
        }

        if (body.title !== undefined) {
            const title = normalizeString(body.title)

            if (!title) {
                return res.status(400).json({ error: "Deck title is required" })
            }

            if (title.length > 60) {
                return res.status(400).json({ error: "Deck title is too long" })
            }

            updateFields.title = title
        }

        if (body.description !== undefined) {
            const description = normalizeString(body.description)
            updateFields.description = description || null
        }

        if (body.format !== undefined) {
            const format = normalizeString(body.format)
            updateFields.format = format || null
        }

        if (body.visibility !== undefined) {
            if (!ALLOWED_VISIBILITY.has(body.visibility)) {
                return res.status(400).json({ error: "Invalid visibility" })
            }

            updateFields.visibility = body.visibility
        }

        // to avoid unnecessary db calls
        const hasActualChanges = Object.keys(updateFields).some((key) => key !== "updatedAt")

        if (!hasActualChanges) {
            return res.status(400).json({ error: "No valid fields provided for update" })
        }

        await db.collection("decks").updateOne(
            {
                _id: deckObjectId,
                ownerId: ownerObjectId,
            },
            {
                $set: updateFields,
            }
        )

        const updatedDeck = await db.collection("decks").findOne({
            _id: deckObjectId,
            ownerId: ownerObjectId,
        })

        return res.status(200).json({
            success: true,
            deck: {
                id: updatedDeck?._id.toString(),
                title: (updatedDeck as any)?.title ?? "",
                game: (updatedDeck as any)?.game ?? "",
                description: (updatedDeck as any)?.description ?? null,
                format: (updatedDeck as any)?.format ?? null,
                visibility: (updatedDeck as any)?.visibility ?? "private", //private default
                cards: Array.isArray((updatedDeck as any)?.cards) ? (updatedDeck as any).cards : [],
                createdAt: (updatedDeck as any)?.createdAt ?? null,
                updatedAt: (updatedDeck as any)?.updatedAt ?? null,
            },
        })
    }

    // delete the specified deck
    if (req.method === "DELETE") {
        const deleteResult = await db.collection("decks").deleteOne({
            _id: deckObjectId,
            ownerId: ownerObjectId,
        })

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: "Deck not found" })
        }

        return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: "Method not allowed" })
}