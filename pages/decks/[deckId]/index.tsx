import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Card from "@/components/Card"
import DeckSidebar from "@/components/DeckSidebar"
import DeckCardSearch from "@/components/DeckCardSearch"
import {
    addDeckCard,
    fetchDeck,
    removeDeckCard,
    updateDeck,
    updateDeckCardQuantity,
} from "@/lib/deckApi"
import { DeckCard, DeckDetails, DeckVisibility } from "@/lib/deckTypes"
import { getTcgProvider } from "@/lib/tcg"
import { fetchPokemonFilterOptions } from "@/lib/tcg/filters/api"
import { pokemonFilterDefinitions } from "@/lib/tcg/filters/pokemon"
import type { FilterOption, FilterState, FilterValue } from "@/lib/tcg/filters/types"
import type { SearchCard } from "@/lib/tcg/types"
import ShareDeckButton from "@/components/ShareDeckButton"
import BackButton from "@/components/BackButton";

function getSearchCardImage(image?: string | null) {
    return image ? `${image}/low.png` : ""
}

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

const fallbackImage = "https://www.uvdesigns.ca/wp-content/themes/uvdesigns2025/img/no_image.jpg";

// Getting info from card raw data
function getDeckCardSubtitle(card: DeckCard) {
    const raw = card.raw as SearchCard | undefined
    return raw?.setName ?? "Unknown set"
}

function getDeckCardNumber(card: DeckCard) {
    return card.id
}

export default function DeckEditorPage() {
    const router = useRouter()
    const { deckId } = router.query
    const { status: authenticationStatus } = useSession()
    const sessionIsLoading = authenticationStatus === "loading"

    const [deck, setDeck] = useState<DeckDetails | null>(null)
    const [pageIsLoading, setPageIsLoading] = useState(true)
    const [pageErrorMessage, setPageErrorMessage] = useState<string | null>(null)

    const [deckTitleInput, setDeckTitleInput] = useState("")
    const [titleIsSaving, setTitleIsSaving] = useState(false)

    const [visibilityInput, setVisibilityInput] = useState<DeckVisibility>("private") //default private
    const [visibilityIsSaving, setVisibilityIsSaving] = useState(false)

    const [searchInput, setSearchInput] = useState("")
    const [submittedSearch, setSubmittedSearch] = useState("")
    const [searchResults, setSearchResults] = useState<SearchCard[]>([])
    const [searchIsLoading, setSearchIsLoading] = useState(false)
    const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null)

    const [searchFilters, setSearchFilters] = useState<FilterState>({
        set: "",
        cardType: "",
        energyType: "",
    })

    const [pokemonSetOptions, setPokemonSetOptions] = useState<FilterOption[]>([])
    const [filtersLoading, setFiltersLoading] = useState(false)
    const [filtersError, setFiltersError] = useState<string | null>(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [setNames, setSetNames] = useState<Record<string, string>>({})
    const [resolvingSetIds, setSetIds] = useState<Record<string, boolean>>({})

    const provider = useMemo(() => {
        if (!deck?.game) return null
        return getTcgProvider(deck.game)
    }, [deck?.game])

    const activeFilters = useMemo(() => {
        if (deck?.game === "pokemon") {
            return pokemonFilterDefinitions(pokemonSetOptions)
        }

        return []
    }, [deck?.game, pokemonSetOptions])

    async function loadDeck() {
        if (!deckId || typeof deckId !== "string") return

        setPageIsLoading(true)
        setPageErrorMessage(null)

        const result = await fetchDeck(deckId)

        if ("error" in result) {
            setDeck(null)
            setPageErrorMessage(result.error)
        } else {
            setDeck(result.deck)
            setDeckTitleInput(result.deck.title)
            setVisibilityInput(result.deck.visibility)
        }

        setPageIsLoading(false)
    }

    useEffect(() => {
        if (!sessionIsLoading && deckId) {
            void loadDeck()
        }
    }, [sessionIsLoading, deckId])

    useEffect(() => {
        let isActive = true

        async function loadPokemonFilters() {
            if (deck?.game !== "pokemon") return

            try {
                setFiltersLoading(true)
                setFiltersError(null)

                const sets = await fetchPokemonFilterOptions()

                if (!isActive) return
                setPokemonSetOptions(sets)
            } catch (error) {
                console.error(error)
                if (!isActive) return
                setFiltersError("Failed to load Pokémon sets.")
            } finally {
                if (isActive) {
                    setFiltersLoading(false)
                }
            }
        }

        void loadPokemonFilters()

        return () => {
            isActive = false
        }
    }, [deck?.game])

    async function handleSaveDeckTitle() {
        if (!deck || !deckId || typeof deckId !== "string") return

        const title = deckTitleInput.trim()

        if (!title) {
            setDeckTitleInput(deck.title)
            return
        }

        if (title === deck.title) return

        setTitleIsSaving(true)
        setPageErrorMessage(null)

        const result = await updateDeck(deckId, { title: title })

        if ("error" in result) {
            setPageErrorMessage(result.error)
            setTitleIsSaving(false)
            return
        }

        setDeck(result.deck)
        setDeckTitleInput(result.deck.title)
        setTitleIsSaving(false)
    }

    async function handleVisibilityChange(nextVisibility: DeckVisibility) {
        if (!deck || !deckId || typeof deckId !== "string") return
        if (visibilityIsSaving) return

        //just incase
        if (nextVisibility === deck.visibility) {
            setVisibilityInput(nextVisibility)
            return
        }

        setVisibilityInput(nextVisibility)
        setVisibilityIsSaving(true)
        setPageErrorMessage(null)

        //updating only visibilty
        const result = await updateDeck(deckId, { visibility: nextVisibility })

        if ("error" in result) {
            setPageErrorMessage(result.error)
            setVisibilityInput(deck.visibility)
            setVisibilityIsSaving(false)
            return
        }

        //syncing deck
        setDeck(result.deck)
        setVisibilityInput(result.deck.visibility)
        setVisibilityIsSaving(false)
    }

    function handleFilterChange(filterId: string, value: FilterValue) {
        setSearchFilters((previous) => ({
            ...previous,
            [filterId]: value,
        }))
    }

    async function handleSearch(event: React.FormEvent) {
        event.preventDefault()

        if (!provider) {
            setSearchResults([])
            setSearchErrorMessage("this game is not supported") // incase the "game" is not developed yet
            return
        }

        const search = searchInput.trim()
        setSubmittedSearch(search)
        setCurrentPage(1)

        setSearchIsLoading(true)
        setSearchErrorMessage(null)

        const cards = await provider.searchCards({
            query: search,
            set: typeof searchFilters.set === "string" ? searchFilters.set : "",
            cardType: typeof searchFilters.cardType === "string" ? searchFilters.cardType : "",
            energyType: typeof searchFilters.energyType === "string" ? searchFilters.energyType : "",
        })

        if (cards.length === 0 && (search || searchFilters.set || searchFilters.cardType || searchFilters.energyType)) {
            setSearchResults([])
            setSearchErrorMessage(null)
            setSearchIsLoading(false)
            return
        }

        setSearchResults(cards)
        setSearchIsLoading(false)
    }

    // caching set names to reduce the times we ahve to call the api
    async function preloadSetName(card: SearchCard) {
        if (!provider) return
        if (setNames[card.id]) return
        if (resolvingSetIds[card.id]) return

        const setName = card.setName

        if (setName) {
            setSetNames((previous) => ({
                ...previous,
                [card.id]: setName,
            }))
            return
        }

        setSetIds((previous) => ({ ...previous, [card.id]: true }))

        try {
            const fullCard = await provider.getCardById(card.id)
            const nextSetName = fullCard?.setName ?? "Unknown set"

            setSetNames((previous) => ({
                ...previous,
                [card.id]: nextSetName,
            }))
        } finally {
            setSetIds((previous) => {
                const next = { ...previous }
                delete next[card.id]
                return next
            })
        }
    }

    function getSetName(card: SearchCard) {
        return setNames[card.id] ?? card.setName ?? "Unknown set"
    }

    async function handleAddCard(card: SearchCard) {
        if (!provider || !deckId || typeof deckId !== "string" || !deck) return

        setPageErrorMessage(null)

        const fullCard = await provider.getCardById(card.id)
        const cardToStore = fullCard ?? card

        const deckCard: DeckCard = {
            id: cardToStore.id,
            name: cardToStore.name,
            image: cardToStore.image ?? null,
            quantity: 1,
            raw: cardToStore,
        }

        const result = await addDeckCard(deckId, deckCard)

        if ("error" in result) {
            setPageErrorMessage(result.error)
            return
        }

        setDeck((previousDeck) => {
            if (!previousDeck) return previousDeck // null cehcking

            const existingCard = previousDeck.cards.find(
                (deckCardInDeck) => deckCardInDeck.id === cardToStore.id
            )

            let nextCards: DeckCard[]

            // quantity increase if card already in deck if not then add card to deck
            if (existingCard) {
                nextCards = previousDeck.cards.map((deckCardInDeck) =>
                    deckCardInDeck.id === cardToStore.id
                        ? {
                            ...deckCardInDeck,
                            quantity: deckCardInDeck.quantity + 1,
                            raw: cardToStore,
                            image: cardToStore.image ?? deckCardInDeck.image,
                            name: cardToStore.name,
                        } : deckCardInDeck
                )
            } else {
                nextCards = [...previousDeck.cards, deckCard]
            }

            return {
                ...previousDeck,
                cards: nextCards,
                updatedAt: result.updatedAt,
            }
        })

        const setName = cardToStore.setName

        if (setName) {
            setSetNames((previous) => ({
                ...previous,
                [card.id]: setName,
            }))
        }
    }

    async function handleIncreaseQuantity(card: DeckCard) {
        if (!deckId || typeof deckId !== "string") return

        const nextQuantity = card.quantity + 1
        const result = await updateDeckCardQuantity(deckId, card.id, nextQuantity)

        if ("error" in result) {
            setPageErrorMessage(result.error)
            return
        }

        // very confusing and took like an hour to figure out myself but this is just increasing the quantity if it changed
        setDeck((previousDeck) =>
            previousDeck
                ? {
                    ...previousDeck,
                    cards: previousDeck.cards.map((deckCardInDeck) =>
                        deckCardInDeck.id === card.id ? result.card : deckCardInDeck
                    ),
                    updatedAt: result.updatedAt,
                } : previousDeck
        )
    }

    async function handleDecreaseQuantity(card: DeckCard) {
        if (!deckId || typeof deckId !== "string") return

        if (card.quantity <= 1) {
            const result = await removeDeckCard(deckId, card.id)

            if ("error" in result) {
                setPageErrorMessage(result.error)
                return
            }

            setDeck((previousDeck) =>
                previousDeck
                    ? {
                        ...previousDeck,
                        cards: previousDeck.cards.filter(
                            (deckCardInDeck) => deckCardInDeck.id !== card.id
                        ),
                        updatedAt: result.updatedAt,
                    }
                    : previousDeck
            )

            return
        }

        const nextQuantity = card.quantity - 1
        const result = await updateDeckCardQuantity(deckId, card.id, nextQuantity)

        if ("error" in result) {
            setPageErrorMessage(result.error)
            return
        }

        setDeck((previousDeck) =>
            previousDeck
                ? {
                    ...previousDeck,
                    cards: previousDeck.cards.map((deckCardInDeck) =>
                        deckCardInDeck.id === card.id ? result.card : deckCardInDeck
                    ),
                    updatedAt: result.updatedAt,
                }
                : previousDeck
        )
    }

    const filteredSearchResults = searchResults

    // 12 cards per page
    const resultsPerPage = 12
    const totalPages = Math.max(1, Math.ceil(filteredSearchResults.length / resultsPerPage))

    const paginatedSearchResults = useMemo(() => {
        const startIndex = (currentPage - 1) * resultsPerPage
        return filteredSearchResults.slice(startIndex, startIndex + resultsPerPage)
    }, [filteredSearchResults, currentPage])

    // Just incase the pagenumber goes over for some reason this kept happening
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const totalCardsInDeck = deck?.cards.reduce((total: number, card: { quantity: number }) => total + card.quantity, 0) ?? 0

    // Sort cards in deck alphabetically
    const deckCardsSorted = useMemo(() => {
        if (!deck) return []

        return [...deck.cards].sort((firstCard, secondCard) =>
            firstCard.name.localeCompare(secondCard.name)
        )
    }, [deck])

    if (sessionIsLoading || pageIsLoading) {
        return (
            <div className="min-h-screen text-white">
                <div className="mx-auto max-w-7xl px-6 pt-12 pb-10">
                    <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-xl">
                        <p className="text-sm text-gray-300">Loading deck editor</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!deck) {
        return (
            <div className="min-h-screen text-white">
                <div className="mx-auto max-w-7xl px-6 pt-12 pb-10">
                    <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-xl">
                        <p className="text-sm text-red-400">
                            {pageErrorMessage ?? "Deck not found."}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto max-w-7xl px-6 pt-10 pb-10">

                {/*top row above page content*/}
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <BackButton fallbackHref="/decks/discover" />
                    {/*right section of top row */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Visibility change toggle thing */}
                        <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-1">
                            <button
                                type="button"
                                onClick={() => void handleVisibilityChange("private")}
                                disabled={visibilityIsSaving}
                                className={`rounded-l-lg px-3 py-2 text-sm font-medium cursor-pointer ${
                                    visibilityInput === "private"
                                        ? "text-white bg-white/10"
                                        : "text-white hover:bg-white/10"
                                }`}
                            >
                                Private
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleVisibilityChange("unlisted")}
                                disabled={visibilityIsSaving}
                                className={`px-3 py-2 text-sm font-medium cursor-pointer ${
                                    visibilityInput === "unlisted"
                                        ? "text-white bg-white/10"
                                        : "text-white hover:bg-white/10"
                                }`}
                            >
                                Unlisted
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleVisibilityChange("public")}
                                disabled={visibilityIsSaving}
                                className={`rounded-r-lg px-3 py-2 text-sm font-medium cursor-pointer ${
                                    visibilityInput === "public"
                                        ? "text-white bg-white/10"
                                        : "text-white hover:bg-white/10"
                                }`}
                            >
                                Public
                            </button>
                        </div>
                        {visibilityIsSaving ? (
                            <span className="text-xs text-gray-400">Saving...</span>
                        ) : null}

                        <Link
                            href={`/decks/${deck.id}/public`}
                            className="inline-flex h-10 items-center justify-center px-4 hover:cursor-pointer rounded-lg border border-white/10 bg-white/5 py-2 text-sm font-medium text-white hover:bg-white/10"
                        >
                            View
                        </Link>

                        <ShareDeckButton
                            deckId={deck.id}
                            visibility={deck.visibility}
                            className="inline-flex h-10 items-center justify-center px-4 hover:cursor-pointer"
                        />
                    </div>
                </div>

                <div className="mb-8 rounded-2xl border border-white/10 bg-gray-900/60 p-6 shadow-2xl">
                    <div className="flex flex-col gap-6">
                        <div className="min-w-0">
                            <div className="text-xs uppercase tracking-[0.22em] text-gray-400">
                                {deck.game}
                            </div>

                            <div className="mt-3 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1">
                                    <input
                                        type="text"
                                        value={deckTitleInput}
                                        onChange={(event) => setDeckTitleInput(event.target.value)}
                                        onBlur={handleSaveDeckTitle}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault()
                                                handleSaveDeckTitle()
                                            }
                                        }}
                                        className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-lg font-semibold text-white outline-none transition placeholder:text-gray-500 focus:border-blue-400/60"
                                        placeholder="Deck title"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveDeckTitle}
                                    disabled={titleIsSaving}
                                    className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-blue-500/20 px-6 text-sm font-semibold text-white transition hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {titleIsSaving ? "Saving..." : "Save Title"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {pageErrorMessage && (
                        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {pageErrorMessage}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <section className="min-w-0 overflow-visible">
                        <div className="overflow-visible rounded-2xl border border-white/10 bg-gray-900/50 p-5 shadow-xl">
                            <DeckCardSearch
                                searchValue={searchInput}
                                onSearchValueChange={setSearchInput}
                                onSubmit={handleSearch}
                                isLoading={searchIsLoading}
                                filters={activeFilters}
                                filterValues={searchFilters}
                                onFilterChange={handleFilterChange}
                                filtersLoading={filtersLoading}
                                filtersError={filtersError}
                            />

                            {(submittedSearch || searchResults.length > 0) && (
                                <div className="mb-3 flex flex-col p-1 md:flex-row md:items-center md:justify-between">
                                    <div className="text-sm text-gray-300">
                                        {filteredSearchResults.length} cards
                                    </div>
                                </div>
                            )}

                            {searchErrorMessage && (
                                <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {searchErrorMessage}
                                </div>
                            )}

                            {!searchIsLoading &&
                            submittedSearch &&
                            filteredSearchResults.length === 0 ? (
                                <div className="rounded-lg border border-white/10 bg-gray-800/30 p-10 text-center">
                                    <p className="text-base font-medium text-gray-200">
                                        No cards found
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 overflow-visible sm:grid-cols-2 xl:grid-cols-3">
                                    {paginatedSearchResults.map((card) => {
                                        const quantityInDeck =
                                            deck.cards.find(
                                                (deckCard: { id: string }) => deckCard.id === card.id
                                            )?.quantity ?? 0

                                        return (
                                            <div
                                                key={card.id}
                                                className="relative flex justify-center overflow-visible"
                                                onMouseEnter={() => {
                                                    void preloadSetName(card)
                                                }}
                                            >
                                                {quantityInDeck > 0 && (
                                                    <div className="absolute right-2 bottom-2 z-10001 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                                                        x{quantityInDeck}
                                                    </div>
                                                )}

                                                <Card
                                                    src={getSearchCardImage(card.image) ? getSearchCardImage(card.image) : fallbackImage}
                                                    alt={card.name}
                                                    width={250}
                                                    height={350}
                                                    name={card.name}
                                                    setName={getSetName(card)}
                                                    onClick={() => handleAddCard(card)}
                                                    showOverlay={true}
                                                    showDetails={true}
                                                    overlayText="Add"
                                                    overlayIcon="+"
                                                    clickAriaLabel={`Add ${card.name} to deck`}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* pagination */}
                            {filteredSearchResults.length > resultsPerPage && (
                                <div className="mt-6 flex items-center justify-between rounded-lg border border-white/10 bg-black/10 px-4 py-3">
                                    <button
                                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        disabled={currentPage === 1}
                                        className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <div className="text-sm text-gray-300">
                                        Page {currentPage} of {totalPages}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setCurrentPage((page) => Math.min(totalPages, page + 1))
                                        }
                                        disabled={currentPage === totalPages}
                                        className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    <DeckSidebar
                        cards={deckCardsSorted}
                        totalCardsInDeck={totalCardsInDeck}
                        getDeckCardImage={getDeckCardImage}
                        getDeckCardSubtitle={getDeckCardSubtitle}
                        getDeckCardNumber={getDeckCardNumber}
                        onDecreaseQuantity={handleDecreaseQuantity}
                        onIncreaseQuantity={handleIncreaseQuantity}
                    />
                </div>
            </div>
        </div>
    )
}