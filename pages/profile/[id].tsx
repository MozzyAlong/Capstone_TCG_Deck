import type { GetServerSideProps } from "next"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchPublicDecksByOwner } from "@/lib/deckApi"
import type { PublicDeckListItem } from "@/lib/deckTypes"

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
    const [publicDecks, setPublicDecks] = useState<PublicDeckListItem[]>([])
    const [loadingDecks, setLoadingDecks] = useState(true)
    const [deckError, setDeckError] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.id) {
            setLoadingDecks(false)
            return
        }

        const ownerId = user.id
        let isActive = true

        async function loadPublicDecks() {
            try {
                setLoadingDecks(true)
                setDeckError(null)

                const result = await fetchPublicDecksByOwner(ownerId)

                if (!isActive) return

                if ("error" in result) {
                    setDeckError(result.error)
                    setPublicDecks([])
                    return
                }

                setPublicDecks(result.decks)
            } catch (error) {
                console.error(error)

                if (!isActive) return

                setDeckError("Failed to load public decks.")
                setPublicDecks([])
            } finally {
                if (isActive) {
                    setLoadingDecks(false)
                }
            }
        }

        void loadPublicDecks()

        return () => {
            isActive = false
        }
    }, [user?.id])

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
                    <div>

                        {/* bio */}
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

                    <div>
                        {/* section for users public decks */}
                        <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-4">
                            Public Decks
                        </h2>

                        {loadingDecks ? (
                            <p className="text-sm text-gray-400">Loading public decks...</p>
                        ) : deckError ? (
                            <p className="text-sm text-red-300">{deckError}</p>
                        ) : publicDecks.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                                This user has not shared any public decks yet.
                            </p>
                        ) : (
                            /* small deck cards */
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {publicDecks.map((deck) => (
                                    <Link
                                        key={deck.id}
                                        href={`/decks/${deck.id}/public`}
                                        className="rounded-2xl border border-white/10 bg-gray-900/50 p-5 hover:border-blue-400/40 hover:bg-gray-900/70"
                                    >
                                        <div className="text-xs uppercase text-gray-400">
                                            {deck.game}
                                        </div>

                                        <h3 className="mt-2 text-lg font-semibold text-white">
                                            {deck.title}
                                        </h3>

                                        <div className="mt-4 space-y-1 text-sm text-gray-300">
                                            <p>Cards: {deck.cardCount}</p>
                                            <p>
                                                Updated:{" "}
                                                {deck.updatedAt
                                                    ? new Date(deck.updatedAt).toLocaleDateString()
                                                    : "Unknown"}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
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

    const session = await getServerSession(context.req, context.res, authOptions)
    const sessionUserId = (session?.user as any)?.id as string | undefined

    return {
        props: {
            user: {
                id: user._id.toString(),
                name: user.name ?? null,
                image: user.image ?? null,
                bio: user.bio ?? null,
            },
            isOwner: sessionUserId === user._id.toString(),
        },
    }
}