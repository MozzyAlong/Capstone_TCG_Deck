export type CardSearchFilters = {
    query?: string
    set?: string
    cardType?: string
    energyType?: string
}

// assuming all cards from tcgs have a set & name, may need to change this later
export type SearchCard = {
    id: string
    name: string
    image?: string | null
    setName?: string | null
    cardNumber?: string | null
    raw?: unknown
}

// Each tcg provider must implement these
export interface TcgProvider {
    /**
     * @param filters search filters for the card query
     * @returns The list of cards resulting from the search
     */
    searchCards(filters?: CardSearchFilters): Promise<SearchCard[]>

    /**
     * @param id card id of the card to search for
     * @returns The requested card or null if no card is found
     */
    getCardById(id: string): Promise<SearchCard | null>
}