import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { PlusIcon } from "@heroicons/react/24/outline"
import CreateDeckModal from "@/components/CreateDeckModal"
import DeckSection from "@/components/DeckSection"
import { fetchUserDecks, type DeckInfo } from "@/lib/deckApi"

export default function DeckCreatePage() {
    const router = useRouter()
    const { status: authenticationStatus } = useSession()
    const sessionIsLoading = authenticationStatus === "loading"
    const [deckList, setDeckList] = useState<DeckInfo[]>([])
    const [pageIsLoading, setPageIsLoading] = useState(true)
    const [pageErrorMessage, setPageErrorMessage] = useState<string | null>(null)
    const [createDeckModalIsOpen, setCreateDeckModalIsOpen] = useState(false)
    const [expandedGameSections, setExpandedGameSections] = useState<Record<string, boolean>>({ pokemon: true })

    async function refreshDeckList() {
        setPageIsLoading(true)
        setPageErrorMessage(null)
        const apiResponse = await fetchUserDecks()

        if ("decks" in apiResponse) {
            setDeckList(apiResponse.decks)
        } else {
            setDeckList([])
            setPageErrorMessage(apiResponse.error)
        }
        setPageIsLoading(false)
    }

    // On reload
    useEffect(() => {
        if (!sessionIsLoading) {
            refreshDeckList()
        }
    }, [sessionIsLoading])


    // To sort the games into the dividers even though we only have one game now
    // https://react.dev/reference/react/useMemo
    const decksGroupedByGame = useMemo(() => {
        const groupingMap = new Map<string, DeckInfo[]>()

        // sorting decks into groups based on game
        for (const deck of deckList) {
            const gameKey = deck.game.toLowerCase()

            if (!groupingMap.has(gameKey)) {
                groupingMap.set(gameKey, [])
            }

            groupingMap.get(gameKey)!.push(deck)
        }

        // sort each game group by date
        for (const [gameKey, decksForGame] of groupingMap.entries()) {
            decksForGame.sort((firstDeck, secondDeck) => {
                const firstDeckTime = Date.parse(firstDeck.updatedAt ?? firstDeck.createdAt ?? "") || 0
                const secondDeckTime = Date.parse(secondDeck.updatedAt ?? secondDeck.createdAt ?? "") || 0

                return secondDeckTime - firstDeckTime
            })

            groupingMap.set(gameKey, decksForGame)
        }


        // map into array
        const groupingEntries = Array.from(groupingMap.entries())

        groupingEntries.sort(([firstGameKey], [secondGameKey]) => {
            return firstGameKey.localeCompare(secondGameKey)
        })

        return groupingEntries
    }, [deckList])

    // Making sure every grouping has expanded/not expanded
    useEffect(() => {
        setExpandedGameSections((previousState) => {
            const nextState = { ...previousState }

            for (const [gameKey] of decksGroupedByGame) {
                if (nextState[gameKey] === undefined) {
                    nextState[gameKey] = true
                }
            }

            return nextState
        })
    }, [decksGroupedByGame])

    function toggleGameSectionExpanded(gameKey: string) {
        setExpandedGameSections((previousState) => ({
            ...previousState,
            [gameKey]: !previousState[gameKey], //toggle
        }))
    }

    async function handleDeckDeleted() {
        await refreshDeckList()
    }

    async function handleDeckCreated(newDeckId: string) {
        setCreateDeckModalIsOpen(false)
        await refreshDeckList()
        router.push(`/decks/${newDeckId}`) //redirecting to deck editing when a deck is created
    }

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto max-w-5xl px-6 pt-12 pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold">
                            Decks
                        </h1>
                        <div className="mt-2 text-xs text-gray-400">
                            {pageIsLoading ? (
                                <>Loading</>
                            ) : (
                                <>
                                    <span className="text-gray-200">{deckList.length}</span> total deck
                                    {deckList.length === 1 ? "" : "s"}
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setCreateDeckModalIsOpen(true)}
                        className="inline-flex items-center cursor-pointer gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-white/10 bg-blue-500/25 hover:bg-blue-500/35 transition"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Create Deck
                    </button>
                </div>
                <div className="mt-8 space-y-10">
                    {pageIsLoading ? (
                        <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-xl">
                            <p className="text-sm text-gray-300">Loading decks</p>
                        </div>
                    ) : pageErrorMessage ? (
                        <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-xl">
                            <p className="text-sm text-red-400">{pageErrorMessage}</p>
                        </div>
                    ) : (
                        decksGroupedByGame.map(([gameKey, decksForGame]) => (
                            <DeckSection
                                key={gameKey}
                                gameKey={gameKey}
                                decks={decksForGame}
                                isExpanded={expandedGameSections[gameKey]}
                                onToggle={() => toggleGameSectionExpanded(gameKey)}
                                onDeckDeleted={handleDeckDeleted}
                            />
                        ))
                    )}
                </div>
            </div>

            {createDeckModalIsOpen && (
                <CreateDeckModal
                    onClose={() => setCreateDeckModalIsOpen(false)}
                    onCreated={handleDeckCreated}
                />
            )}
        </div>
    )
}