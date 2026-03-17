import type { TcgProvider } from "@/lib/tcg/types"
import { pokemonProvider } from "@/lib/tcg/pokemon"

// main file for tcg stuff for allowing the edit page to handle different tcgs right now only pokemon though
export function getTcgProvider(game: string): TcgProvider | null {
    switch (game.toLowerCase()) {
        case "pokemon":
            return pokemonProvider
        default:
            return null
    }
}