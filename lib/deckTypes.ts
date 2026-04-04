export type ApiErrorResponse = {
    error: string
}

export type DeckVisibility = "private" | "unlisted" | "public"

export type DeckInfo = {
    id: string
    title: string
    game: string
    visibility: DeckVisibility
    createdAt: string | null
    updatedAt: string | null
    cardCount: number
}

export type DeckCard = {
    id: string
    name: string
    image: string | null
    quantity: number
    raw: unknown
}

export type DeckDetails = DeckInfo & {
    description: string | null
    format: string | null
    cards: DeckCard[]
    authorId: string | null
    authorName: string | null
}

export type DeckListApiResponse = { decks: DeckInfo[] } | ApiErrorResponse

export type DeckCreateApiResponse = { deckId: string } | ApiErrorResponse

export type DeckDetailsApiResponse = { deck: DeckDetails } | ApiErrorResponse

export type DeckUpdateApiResponse =
    {
        success: true
        deck: DeckDetails
    } | ApiErrorResponse

export type DeckCardsApiResponse =
    {
        cards: DeckCard[]
        count: number
    } | ApiErrorResponse

export type DeckCardsReplaceApiResponse =
    {
        success: true
        cards: DeckCard[]
        count: number
        updatedAt: string
    } | ApiErrorResponse

export type DeckCardAddApiResponse =
    {
        success: true
        cards: DeckCard[]
        count: number
        updatedAt: string
    } | ApiErrorResponse

export type SingleDeckCardApiResponse =
    {
        card: DeckCard
    } | ApiErrorResponse

export type DeckCardUpdateApiResponse =
    {
        success: true
        card: DeckCard
        updatedAt: string
    } | ApiErrorResponse

export type DeckCardDeleteApiResponse =
    {
        success: true
        removedCard: DeckCard
        updatedAt: string
    } | ApiErrorResponse

export type DeleteDeckApiResponse = { success: true } | ApiErrorResponse

export type UpdateDeckPayload = {
    title?: string
    description?: string
    format?: string
    visibility?: DeckVisibility
}

export type CreateDeckPayload = {
    title: string
    game: string
    visibility: DeckVisibility
    description?: string
    format?: string
}

export type PublicDeckListItem = DeckInfo & {
    authorId: string | null
    authorName: string | null
    authorImage: string | null
}

export type PublicDeckSearchApiResponse =
    {
        decks: PublicDeckListItem[]
        total: number
        page: number
        totalPages: number
    } | ApiErrorResponse