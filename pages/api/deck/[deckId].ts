import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" })
    }

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

    const deleteResult = await db.collection("decks").deleteOne({
        _id: deckObjectId,
        ownerId: ownerObjectId,
    })

    if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: "Deck not found" })
    }

    return res.status(200).json({ success: true })
}