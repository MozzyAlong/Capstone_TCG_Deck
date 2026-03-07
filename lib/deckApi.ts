// This lib only kinda needed cause we are using typescript and need types for some stuff
// also this doesnt run on server its on client
export type DeckVisibility = "private" | "unlisted" | "public"

export type DeckInfo = {
    id: string
    title: string
    game: string
    visibility: DeckVisibility
    createdAt: string | null
    updatedAt: string | null
}

type DeckListApiResponse =
    | { decks: DeckInfo[] }
    | { error: string }

type DeckCreateApiResponse =
    | { deckId: string }
    | { error: string }

const DECK_API_BASE_PATH = "/api/deck"

export async function fetchUserDecks(): Promise<DeckListApiResponse> {
    const response = await fetch(DECK_API_BASE_PATH)
    return (await response.json()) as DeckListApiResponse
}

export async function createDeckApiRequest(payload: {
    title: string
    game: string
    visibility: DeckVisibility
    description?: string
    format?: string
}): Promise<DeckCreateApiResponse> {
    const response = await fetch(DECK_API_BASE_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    return (await response.json()) as DeckCreateApiResponse
}