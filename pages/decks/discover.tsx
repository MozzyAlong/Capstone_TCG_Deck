import Link from "next/link"
import { useEffect, useState } from "react"
import {
    fetchPublicDecks,
} from "@/lib/deckApi"
import type { PublicDeckListItem } from "@/lib/deckTypes"

export default function DiscoverDecksPage() {
    const [searchInput, setSearchInput] = useState("")
    const [submittedSearch, setSubmittedSearch] = useState("")
    const [selectedGame, setSelectedGame] = useState("")

    const [decks, setDecks] = useState<PublicDeckListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        let isActive = true

        async function loadDecks() {
            try {
                setLoading(true)
                setError(null)

                const result = await fetchPublicDecks({
                    query: submittedSearch,
                    game: selectedGame,
                    page,
                })

                if (!isActive) return

                if ("error" in result) {
                    setError(result.error)
                    setDecks([])
                    setTotalPages(1)
                    return
                }

                setDecks(result.decks)
                setTotalPages(result.totalPages)
            } catch (err) {
                console.error(err)
                if (!isActive) return
                setError("Failed to load public decks.")
                setDecks([])
                setTotalPages(1)
            } finally {
                if (isActive) {
                    setLoading(false)
                }
            }
        }

        void loadDecks()

        return () => {
            isActive = false
        }
    }, [submittedSearch, selectedGame, page])

    function handleSearch(event: React.FormEvent) {
        event.preventDefault()
        setPage(1)
        setSubmittedSearch(searchInput.trim())
    }

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto max-w-7xl px-6 pb-10 pt-10">
                <div className="mb-8 rounded-2xl border border-white/10 bg-gray-900/60 p-6">
                    <h1 className="text-2xl font-semibold text-white">Discover Decks</h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Browse publicly shared decks from other users.
                    </p>
                </div>

                <div className="mb-6 rounded-2xl border border-white/10 bg-gray-900/50 p-5">
                    <form onSubmit={handleSearch} className="flex flex-col gap-4 lg:flex-row">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search deck titles"
                            className="h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-400/60"
                        />

                        <select
                            value={selectedGame}
                            onChange={(e) => {
                                setPage(1)
                                setSelectedGame(e.target.value)
                            }}
                            className="h-12 rounded-lg border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-blue-400/60"
                        >
                            <option value="">All Games</option>
                            <option value="pokemon">Pokémon</option> {/* RIGHT NOW ONLY POKEMON CHANGE THIS IN FUTURE FUTURE ME */ }
                        </select>

                        <button
                            type="submit"
                            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-blue-500/25 px-6 text-sm font-semibold text-white hover:bg-blue-500/35"
                        >
                            Search
                        </button>
                    </form>
                </div>
                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-6">
                        <p className="text-sm text-gray-300">Loading decks...</p>
                    </div>
                ) : decks.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-10 text-center">
                        <p className="text-base font-medium text-gray-200">
                            No public decks found
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {decks.map((deck) => (
                                <Link
                                    key={deck.id}
                                    href={`/decks/${deck.id}/public`}
                                    className="rounded-2xl border border-white/10 bg-gray-900/50 p-5 hover:border-blue-400/40 hover:bg-gray-900/70"
                                >
                                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400">
                                        {deck.game}
                                    </div>

                                    <h2 className="mt-2 text-lg font-semibold text-white">
                                        {deck.title}
                                    </h2>

                                    {/* author */}
                                    <div className="mt-4 flex items-center gap-3">
                                        {deck.authorImage ? (
                                            <img
                                                src={deck.authorImage}
                                                alt={deck.authorName ?? "User avatar"}
                                                className="h-10 w-10 rounded-full border border-white/10 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
                                                { /* needed for typescript type checking */ }
                                                {(deck.authorName ?? "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400">Author</p>
                                            <p className="truncate text-sm font-medium text-white">
                                                {deck.authorName ?? "Unknown user"}
                                            </p>
                                        </div>
                                    </div>

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

                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between rounded-lg border border-white/10 bg-black/10 px-4 py-3">
                                <button
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <div className="text-sm text-gray-300">
                                    Page {page} of {totalPages}
                                </div>

                                <button
                                    onClick={() =>
                                        setPage((p) => Math.min(totalPages, p + 1))
                                    }
                                    disabled={page === totalPages}
                                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}