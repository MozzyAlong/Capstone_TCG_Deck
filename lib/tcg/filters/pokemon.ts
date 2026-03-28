import type { FilterDefinition, FilterOption } from "./types"

export const POKEMON_CARD_TYPE_OPTIONS: FilterOption[] = [
    { value: "pokemon", label: "Pokémon" },
    { value: "trainer", label: "Trainer" },
    { value: "energy", label: "Energy" },
]

export const POKEMON_ENERGY_TYPE_OPTIONS: FilterOption[] = [
    { value: "grass", label: "Grass" },
    { value: "fire", label: "Fire" },
    { value: "water", label: "Water" },
    { value: "lightning", label: "Lightning" },
    { value: "psychic", label: "Psychic" },
    { value: "fighting", label: "Fighting" },
    { value: "darkness", label: "Darkness" },
    { value: "metal", label: "Metal" },
    { value: "dragon", label: "Dragon" },
    { value: "colorless", label: "Colorless" },
    { value: "fairy", label: "Fairy" },
]

export function pokemonFilterDefinitions(setOptions: FilterOption[]): FilterDefinition[] {
    return [
        {
            id: "set",
            label: "Set",
            placeholder: "All Sets",
            mode: "single",
            options: setOptions,
        },
        {
            id: "cardType",
            label: "Card Type",
            placeholder: "All Card Types",
            mode: "single",
            options: POKEMON_CARD_TYPE_OPTIONS,
        },
        {
            id: "energyType",
            label: "Pokémon Type",
            placeholder: "All Pokémon Types",
            mode: "single",
            options: POKEMON_ENERGY_TYPE_OPTIONS,
        },
    ]
}