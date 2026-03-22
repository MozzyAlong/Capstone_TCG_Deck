import clientPromise from "@/lib/db"
import type { FilterOption } from "@/lib/tcg/filters/types"

const TCGDEX_SETS_URL = "https://api.tcgdex.net/v2/en/sets"
const CACHE_REFRESH_INTERVAL = 48 * 60 * 60 * 1000 // If the cache in the db is 48 hours old check the api again

// These types will move later
type TcgdexSet = {
    id: string
    name: string
    releaseDate?: string
}

type PokemonFilterCache = {
    game: "pokemon"
    sets: FilterOption[]
    updatedAt: Date
    expiresAt: Date
}

function mapSetsToFilterOptions(sets: TcgdexSet[]): FilterOption[] {
    return sets
        .slice()
        .sort(
            (a, b) =>
                new Date(b.releaseDate ?? 0).getTime() -
                new Date(a.releaseDate ?? 0).getTime()
        )
        .map((set) => ({
            value: set.id,
            label: set.name,
        }))
}

async function fetchPokemonSetsFromApi(): Promise<FilterOption[]> {
    const response = await fetch(TCGDEX_SETS_URL)

    if (!response.ok) {
        throw new Error(`Failed to fetch Pokémon sets: ${response.status}`)
    }

    const data = (await response.json()) as TcgdexSet[]
    return mapSetsToFilterOptions(data)
}

// Getting options for filter
export async function getOrRefreshPokemonFilter(): Promise<FilterOption[]> {
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection<PokemonFilterCache>("filterCaches")

    const now = new Date()
    const cached = await collection.findOne({ game: "pokemon" })

    if (cached && new Date(cached.expiresAt).getTime() > now.getTime()) {
        return cached.sets
    }

    try {
        const freshSets = await fetchPokemonSetsFromApi()
        const expiresAt = new Date(now.getTime() + CACHE_REFRESH_INTERVAL)

        // saving the cache in the db to avoid api calls
        await collection.updateOne(
            { game: "pokemon" },
            {
                $set: {
                    game: "pokemon",
                    sets: freshSets,
                    updatedAt: now,
                    expiresAt,
                },
            },
            { upsert: true }
        )

        return freshSets
    } catch (error) {
        if (cached?.sets?.length) {
            return cached.sets
        }

        throw error
    }
}