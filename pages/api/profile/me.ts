/**
 * @file /api/profile/me
 * @description Gets the logged in users profile.
 * GET: Gets the logged in users profile
 *
 * @author Cole de Ruiter
 * @since 2026-04-04
 */
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

    const session = await getServerSession(req, res, authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    if (!ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid user id" })

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { name: 1, image: 1, bio: 1 } }
    )

    if (!user) return res.status(404).json({ error: "User not found" })

    return res.status(200).json({
        user: {
            id: user._id.toString(),
            name: user.name ?? null,
            image: user.image ?? null,
            bio: (user as any).bio ?? null,
        },
    })
}