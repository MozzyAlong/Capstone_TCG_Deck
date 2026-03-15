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
    searchCards(query?: string): Promise<SearchCard[]>
    getCardById(id: string): Promise<SearchCard | null>
}