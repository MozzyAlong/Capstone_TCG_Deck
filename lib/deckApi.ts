import type {
    CreateDeckPayload,
    DeckCard,
    DeckCardAddApiResponse,
    DeckCardDeleteApiResponse,
    DeckCardsApiResponse,
    DeckCardsReplaceApiResponse,
    DeckCreateApiResponse,
    DeckDetailsApiResponse,
    DeckListApiResponse,
    DeckUpdateApiResponse,
    DeleteDeckApiResponse,
    SingleDeckCardApiResponse,
    UpdateDeckPayload,
    DeckCardUpdateApiResponse,
    PublicDeckSearchApiResponse
} from "@/lib/deckTypes"

const DECK_API_BASE_PATH = "/api/deck"

export async function fetchUserDecks(): Promise<DeckListApiResponse> {
    const response = await fetch(DECK_API_BASE_PATH)
    return (await response.json()) as DeckListApiResponse
}

export async function createDeckApiRequest(payload: CreateDeckPayload): Promise<DeckCreateApiResponse> {
    const response = await fetch(DECK_API_BASE_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    return (await response.json()) as DeckCreateApiResponse
}

export async function fetchDeck(deckId: string): Promise<DeckDetailsApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}`)

    return (await response.json()) as DeckDetailsApiResponse
}

export async function updateDeck(deckId: string, payload: UpdateDeckPayload): Promise<DeckUpdateApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    )

    return (await response.json()) as DeckUpdateApiResponse
}

export async function deleteDeck(deckId: string): Promise<DeleteDeckApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}`,
        {
            method: "DELETE",
        }
    )

    return (await response.json()) as DeleteDeckApiResponse
}

export async function fetchDeckCards(deckId: string): Promise<DeckCardsApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}/cards`)

    return (await response.json()) as DeckCardsApiResponse
}

export async function replaceDeckCards(deckId: string, cards: DeckCard[]): Promise<DeckCardsReplaceApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}/cards`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cards }),
        }
    )

    return (await response.json()) as DeckCardsReplaceApiResponse
}

export async function addDeckCard(deckId: string, card: DeckCard): Promise<DeckCardAddApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}/cards`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ card }),
        }
    )

    return (await response.json()) as DeckCardAddApiResponse
}

export async function fetchDeckCard(deckId: string, cardId: string): Promise<SingleDeckCardApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}`)

    return (await response.json()) as SingleDeckCardApiResponse
}

export async function updateDeckCardQuantity(deckId: string, cardId: string, quantity: number): Promise<DeckCardUpdateApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
        }
    )

    return (await response.json()) as DeckCardUpdateApiResponse
}

export async function removeDeckCard(deckId: string, cardId: string): Promise<DeckCardDeleteApiResponse> {
    const response = await fetch(`${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(cardId)}`,
        {
            method: "DELETE",
        }
    )

    return (await response.json()) as DeckCardDeleteApiResponse
}

export async function fetchPublicDecks(params?: {
    query?: string
    game?: string
    page?: number
}): Promise<PublicDeckSearchApiResponse> {
    const searchParams = new URLSearchParams()

    if (params?.query?.trim()) {
        searchParams.set("query", params.query.trim())
    }

    if (params?.game?.trim()) {
        searchParams.set("game", params.game.trim())
    }

    if (params?.page) {
        searchParams.set("page", String(params.page))
    }

    const queryString = searchParams.toString()
    const response = await fetch(`/api/deck/public${queryString ? `?${queryString}` : ""}`)

    return (await response.json()) as PublicDeckSearchApiResponse
}

export async function fetchPublicDeck(deckId: string): Promise<DeckDetailsApiResponse> {
    const response = await fetch(
        `${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}/public`
    )

    return (await response.json()) as DeckDetailsApiResponse
}

export async function fetchPublicDecksByOwner(ownerId: string): Promise<PublicDeckSearchApiResponse> {
    const response = await fetch(`/api/deck/public/${encodeURIComponent(ownerId)}`)
    return (await response.json()) as PublicDeckSearchApiResponse
}

export async function copyDeckToMyDecks(sourceDeckId: string): Promise<{ deckId: string }> {
    const sourceDeckResult = await fetchPublicDeck(sourceDeckId)

    if (!("deck" in sourceDeckResult) || !sourceDeckResult.deck) {
        throw new Error("error" in sourceDeckResult ? sourceDeckResult.error : "Failed to load source deck")
    }

    const sourceDeck = sourceDeckResult.deck

    const createResult = await createDeckApiRequest({
        title: `${sourceDeck.title ?? "Untitled Deck"} (Copy)`,
        game: sourceDeck.game,
        description: sourceDeck.description ?? "",
        format: sourceDeck.format ?? "standard",
        visibility: "private",
    })

    if (!("deckId" in createResult) || !createResult.deckId) {
        throw new Error("error" in createResult ? createResult.error : "Failed to create copied deck")
    }

    const newDeckId = createResult.deckId

    const replaceResult = await replaceDeckCards(
        newDeckId,
        Array.isArray(sourceDeck.cards) ? sourceDeck.cards : []
    )

    if (!("success" in replaceResult) || !replaceResult.success) {
        throw new Error("error" in replaceResult ? replaceResult.error : "Failed to copy deck cards")
    }

    return { deckId: newDeckId }
}

// Comment Submission
export async function addDeckComment(
    deckId: string,
    comment: string
): Promise<{ success?: boolean; error?: string }> {
    const response = await fetch(
        `${DECK_API_BASE_PATH}/${encodeURIComponent(deckId)}/comments`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment }),
        }
    )

    return await response.json()
}