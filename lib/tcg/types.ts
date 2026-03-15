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
     * @param name the name of the card to search for
     * @returns The list of cards resulting from the search
     */
    searchCards(name?: string): Promise<SearchCard[]>

    /**
     * @param id card id of the card to search for
     * @returns The requested card or null if not card is found
     */
    getCardById(id: string): Promise<SearchCard | null>
}