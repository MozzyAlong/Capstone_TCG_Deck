import type { GetServerSideProps } from "next"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"
import { getSession } from "next-auth/react"
import Link from "next/link"

type ProfileProps = {
    user: {
        id: string
        name: string | null
        image: string | null
        bio?: string | null
    } | null
    isOwner: boolean
}

export default function Profile({ user, isOwner }: ProfileProps) {
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                User not found
            </div>
        )
    }

    const displayName = user.name ?? "Unnamed User"
    const avatarUrl =
        user.image ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1f2937&color=ffffff`

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto max-w-4xl px-6 pt-10 pb-8 flex items-center gap-6">
                <img
                    src={avatarUrl}
                    alt=""
                    className="h-24 w-24 rounded-full bg-gray-700"
                    referrerPolicy="no-referrer"
                />

                <div>
                    <h1 className="text-3xl font-semibold">{displayName}</h1>

                    {isOwner && (
                        <Link
                            href="/profile/edit"
                            className="mt-3 inline-block text-sm text-blue-400 hover:underline"
                        >
                            Edit Profile
                        </Link>
                    )}
                </div>
            </div>

            {/* divider*/}
            <div className="mx-auto max-w-4xl px-6">
                <div className="border-t border-white/10" />
            </div>

            <div className="mx-auto max-w-4xl px-6 py-10">
                <div className="space-y-8">

                    {/* bio */}
                    <div>
                        <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">
                            Bio
                        </h2>

                        {user.bio ? (
                            <p className="text-gray-300 leading-relaxed">
                                {user.bio}
                            </p>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                This user has not added a bio yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params ?? {}

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
        return { notFound: true }
    }

    const client = await clientPromise
    const db = client.db()

    const user = await db.collection("users").findOne(
        { _id: new ObjectId(id) },
        { projection: { name: 1, image: 1, bio: 1 } }
    )

    if (!user) {
        return { notFound: true }
    }

    const session = await getSession(context)
    const sessionUserId = (session?.user as any)?.id

    return {
        props: {
            user: {
                id: user._id.toString(),
                name: user.name ?? null,
                image: user.image ?? null,
                bio: user.bio ?? null,
            },
            isOwner: sessionUserId === id,
        },
    }
}