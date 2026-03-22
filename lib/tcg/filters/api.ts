import type { FilterOption } from "@/lib/tcg/filters/types"

type PokemonFiltersApiResponse = {
    ok: true
    sets: FilterOption[]
} | {
    ok: false
    error: string
    sets: []
}

export async function fetchPokemonFilterOptions(): Promise<FilterOption[]> {
    const response = await fetch("/api/filters/pokemon")
    const data = (await response.json()) as PokemonFiltersApiResponse

    if (!response.ok) {
        throw new Error("Failed to load Pokémon filters")
    }

    if (!data.ok) {
        throw new Error(data.error)
    }

    return data.sets
}