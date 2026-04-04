import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import Card from "@/components/Card"
import { copyDeckToMyDecks, fetchPublicDeck } from "@/lib/deckApi"
import type { DeckCard, DeckDetails } from "@/lib/deckTypes"
import type { SearchCard } from "@/lib/tcg/types"
import BackButton from "@/components/BackButton"
import ShareDeckButton from "@/components/ShareDeckButton"

function getDeckCardImage(card: DeckCard) {
    if (card.image) {
        return `${card.image}/low.png`
    }

    const raw = card.raw as SearchCard | undefined
    if (raw?.image) {
        return `${raw.image}/low.png`
    }

    return ""
}

function getDeckCardSetName(card: DeckCard) {
    const raw = card.raw as SearchCard | undefined
    return raw?.setName ?? "Unknown set"
}

// for visibility label maybe put this lib later
function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const fallbackImage = "https://www.uvdesigns.ca/wp-content/themes/uvdesigns2025/img/no_image.jpg"

export default function PublicDeckPage() {
    const router = useRouter()
    const { deckId } = router.query
    const { status } = useSession() // logged in status

    const [deck, setDeck] = useState<DeckDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copying, setCopying] = useState(false)
    const [copyError, setCopyError] = useState<string | null>(null)

    // deck info
    useEffect(() => {
        if (typeof deckId !== "string") return

        const safeDeckId = deckId
        let isActive = true

        async function loadDeck() {
            try {
                setLoading(true)
                setError(null)

                const result = await fetchPublicDeck(safeDeckId)

                if (!isActive) return

                if ("error" in result) {
                    setDeck(null)
                    setError(result.error)
                    return
                }

                setDeck(result.deck)
            } catch (err) {
                console.error(err)
                if (!isActive) return
                setDeck(null)
                setError("Failed to load deck.")
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        void loadDeck()

        return () => {
            isActive = false
        }
    }, [deckId])

    async function handleCopyAndEdit() {
        if (!deck?.id || copying) return

        try {
            setCopying(true)
            setCopyError(null)

            const result = await copyDeckToMyDecks(deck.id)

            await router.push(`/decks/${result.deckId}`) //route to edit page
        } catch (err) {
            console.error(err)
            setCopyError("Failed to copy deck.")
        } finally {
            setCopying(false)
        }
    }

    const totalCards = useMemo(() => {
        return deck?.cards.reduce((total, card) => total + card.quantity, 0) ?? 0
    }, [deck])

    const sortedCards = useMemo(() => {
        if (!deck) return []
        return [...deck.cards].sort((a, b) => a.name.localeCompare(b.name))
    }, [deck])

    if (loading) {
        return (
            <div className="min-h-screen text-white">
                <div className="mx-auto max-w-7xl px-6 pb-10 pt-12">
                    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
                        <p className="text-sm text-gray-300">Loading public deck...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!deck) {
        return (
            <div className="min-h-screen text-white">
                <div className="mx-auto max-w-7xl px-6 pb-10 pt-12">
                    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
                        <p className="text-sm text-red-400">{error ?? "Deck not found."}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto max-w-7xl px-6 pb-10 pt-10">
                <div className="mb-4 flex items-center justify-between">
                    <BackButton fallbackHref="/decks/discover" />

                    <div className="flex items-center gap-3">
                        {status === "authenticated" ? (
                            <button
                                type="button"
                                onClick={handleCopyAndEdit}
                                disabled={copying}
                                className="inline-flex h-10 items-center justify-center px-4 hover:cursor-pointer rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-medium text-white hover:bg-white/10"
                            >
                                {copying ? "Copying..." : "Copy & Edit"}
                            </button>
                        ) : null /*dont display if not authenticated*/}

                        <ShareDeckButton
                            deckId={deck.id}
                            visibility={deck.visibility}
                            className="inline-flex h-10 items-center justify-center px-4 hover:cursor-pointer"
                        />
                    </div>
                </div>

                {copyError ? (
                    <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                        <p className="text-sm text-red-300">{copyError}</p>
                    </div>
                ) : null}

                <div className="mb-8 rounded-2xl border border-white/10 bg-gray-900/60 p-6">
                    <div className="text-xs uppercase tracking-[0.22em] text-gray-400">
                        {deck.game}
                    </div>

                    <h1 className="mt-3 text-3xl font-semibold text-white">
                        {deck.title}
                    </h1>

                    {deck.authorId ? (
                        <div className="mt-2 text-sm text-gray-400">
                            by{" "}
                            <Link
                                href={`/profile/${deck.authorId}`}
                                className="font-medium text-white transition hover:text-blue-300"
                            >
                                {deck.authorName ?? "Unknown user"}
                            </Link>
                        </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-300">
                        <span>{"Visibility: " + capitalizeFirstLetter(deck.visibility)}</span>
                        <span>Total cards: {totalCards}</span>
                        <span>
                            Updated:{" "} {/* spacing */}
                            {deck.updatedAt
                                ? new Date(deck.updatedAt).toLocaleDateString()
                                : "Unknown"}
                        </span>
                    </div>
                </div>

                {sortedCards.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-10 text-center">
                        <p className="text-base font-medium text-gray-200">
                            This deck has no cards.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
                        {sortedCards.map((card) => (
                            <div key={card.id} className="relative flex justify-center">
                                {card.quantity > 1 && (
                                    <div className="absolute bottom-2 right-2 z-10 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                                        x{card.quantity}
                                    </div>
                                )}

                                <Card
                                    src={getDeckCardImage(card) || fallbackImage}
                                    alt={card.name}
                                    width={250}
                                    height={350}
                                    name={card.name}
                                    setName={getDeckCardSetName(card)}
                                    showOverlay={false}
                                    showDetails={true}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}