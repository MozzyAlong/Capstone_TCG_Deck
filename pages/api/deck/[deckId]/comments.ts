import type { NextApiRequest, NextApiResponse } from "next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // handle comment deletion
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user) {
        return res.status(401).json({ error: "You must be logged in" })
    }

    if (req.method === "DELETE") {
        try {
            const { deckId, commentId } = req.query

            if (!deckId || !commentId) {
                return res.status(400).json({ error: "Deck ID and comment ID are required" })
            }

            const client = await clientPromise
            const db = client.db()

            const userId = (session.user as any).id

            // Remove only the comment that belongs to this user
            const result = await db.collection("decks").updateOne(
                { _id: new ObjectId(deckId as string) },
                { $pull: { 
                    comments: { 
                        _id: new ObjectId(commentId as string), 
                        userId: userId,
                    } 
                } }
            )

            if (result.modifiedCount === 0) {
                return res.status(403).json({ error: "You can only delete your own comments" })
            }

            return res.status(200).json({ success: true })
        } catch (err) {
            console.error(err)
            return res.status(500).json({ error: "Failed to delete comment" })
        }
    }

    // Handle Comment Submission
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {
        const session = await getServerSession(req, res, authOptions)

        if (!session?.user) {
            return res.status(401).json({ error: "You must be logged in to comment" })
        }

        const { deckId } = req.query
        const { comment } = req.body

        if (!comment || typeof comment !== "string") {
            return res.status(400).json({ error: "Comment is required" })
        }

        const client = await clientPromise
        const db = client.db()

        const newComment = {
            _id: new ObjectId(),
            userId: (session.user as any).id,
            userName: session.user.name ?? session.user.email ?? "Anonymous", // get username
            comment,
            createdAt: new Date(),
        }

        await db.collection("decks").updateOne(
            { _id: new ObjectId(deckId as string) },
            { $push: { comments: newComment } }
        )

        return res.status(200).json({ success: true })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: "Failed to add comment" })
    }
}