/**
 * @file /api/filters/pokemon.ts
 * @description Gets Pokémon card filter options.
 * GET: Gets available Pokémon set filters either cached or from api
 *
 * @author Cole de Ruiter
 * @since 2026-04-04
 */
import type { NextApiRequest, NextApiResponse } from "next"
import { getOrRefreshPokemonFilter } from "@/lib/tcg/filters/pokemonFilterCache"
import type { FilterOption } from "@/lib/tcg/filters/types"

type PokemonFiltersApiResponse = {
    ok: true
    sets: FilterOption[]
} | {
    ok: false
    error: string
    sets: []
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PokemonFiltersApiResponse>
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET")
        return res.status(405).json({
            ok: false,
            error: "Method not allowed",
            sets: [],
        })
    }

    try {
        const sets = await getOrRefreshPokemonFilter()

        return res.status(200).json({
            ok: true,
            sets,
        })
    } catch (error) {
        console.error("Failed to load Pokémon filter options:", error)

        return res.status(500).json({
            ok: false,
            error: "Failed to load Pokémon filter options",
            sets: [],
        })
    }
}