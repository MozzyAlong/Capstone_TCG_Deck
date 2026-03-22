import type { CardSearchFilters, SearchCard, TcgProvider } from "@/lib/tcg/types"

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
    async searchCards(filters?: CardSearchFilters): Promise<SearchCard[]> {
        try {
            const query = filters?.query?.trim() ?? ""
            const set = filters?.set?.trim() ?? ""
            const cardType = filters?.cardType?.trim() ?? ""
            const pokemonType = filters?.energyType?.trim() ?? ""

            if (!query && !set && !cardType && !pokemonType) {
                return []
            }

            const params = new URLSearchParams()

            if (query) {
                params.set("name", query)
            }

            if (set) {
                params.set("set.id", set)
            }

            if (cardType) {
                params.set("category", cardType)
            }

            if (pokemonType) {
                params.set("types", pokemonType)
            }

            const response = await fetch(
                `https://api.tcgdex.net/v2/en/cards?${params.toString()}`
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