/**
 * @file /api/profile/update.ts
 * @description Handles updates to the loggedin users profile.
 * POST: Updates the user profile fields
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
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    const session = await getServerSession(req, res, authOptions)

    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" }) //double check even though in proxy
    }

    const { name, bio } = req.body as {
        name?: string
        bio?: string
    }

    const cleanName = name?.trim() || null
    const cleanBio = bio?.trim() || null

    if (cleanName && cleanName.length > 28) {
        return res.status(400).json({ error: "Name too long" })
    }

    if (cleanBio && cleanBio.length > 256) {
        return res.status(400).json({ error: "Bio too long" })
    }

    const client = await clientPromise
    const db = client.db()

    await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                name: cleanName,
                bio: cleanBio,
                updatedAt: new Date(),
            },
        }
    )

    return res.status(200).json({ ok: true })
}