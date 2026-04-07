import type { NextApiRequest, NextApiResponse } from "next"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) {
    return res.status(401).json({ error: "You must be logged in to like a deck" })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { deckId } = req.query
  if (!deckId || typeof deckId !== "string" || !ObjectId.isValid(deckId)) {
    return res.status(400).json({ error: "Invalid deck ID" })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Toggle like atomically
    const deck = await db.collection("decks").findOne({ _id: new ObjectId(deckId) })
    if (!deck) return res.status(404).json({ error: "Deck not found" })

    const hasLiked = deck.likes?.includes(userId)

    const updated = await db.collection("decks").findOneAndUpdate(
      { _id: new ObjectId(deckId) },
      hasLiked
        ? { $pull: { likes: userId } }
        : { $addToSet: { likes: userId } },
      { returnDocument: "after" } // return updated document
    )

    const likesCount = updated.value?.likes?.length ?? 0

    return res.status(200).json({ success: true, liked: !hasLiked, count: likesCount })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Failed to toggle like" })
  }
}