import type { SearchCard, TcgProvider } from "@/lib/tcg/types"

function pokemonApiCardToSearchCard(card: any): SearchCard {
    return {
        id: card.id,
        name: card.name,
        image: card.image ?? null,
        setName: card.set?.name ?? null,
        cardNumber: card.localId ?? card.number ?? null,
        raw: card,
    }
}

// array version
function pokemonApiCardsToSearchCards(cards: any[]): SearchCard[] {
    return cards
        .filter((card) => Boolean(card.image))
        .map(pokemonApiCardToSearchCard)
}

export const pokemonProvider: TcgProvider = {
    async searchCards(name?: string): Promise<SearchCard[]> {
        try {
            const trimmedName = name?.trim()

            // so that you cant search nothing and get all cards this is to reduce api calls
            if (!trimmedName) {
                return []
            }

            const response = await fetch(
                `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(trimmedName)}`
            )

            const data = await response.json()

            if (!response.ok || !Array.isArray(data)) {
                return []
            }

            return pokemonApiCardsToSearchCards(data)
        } catch {
            return []
        }
    },

    async getCardById(id: string): Promise<SearchCard | null> {
        try {
            const response = await fetch(
                `https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(id)}`
            )

            if (!response.ok) {
                return null
            }

            const data = await response.json()
            return pokemonApiCardToSearchCard(data)
        } catch {
            return null
        }
    },
}