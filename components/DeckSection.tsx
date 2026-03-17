import {ChevronDownIcon, ChevronRightIcon} from "@heroicons/react/24/outline"
import type { DeckInfo} from "@/lib/deckTypes";
import DeckCard from "./DeckCard"

const GAME_DISPLAY_NAMES: Record<string, string> = {
    pokemon: "Pokémon TCG" //DeckCard.tsx also uses this so i might change later
}

type DeckSectionProps = {
    gameKey: string
    decks: DeckInfo[]
    isExpanded: boolean
    onToggle: () => void
    onDeckDeleted: (deckId: string) => void
}

export default function DeckSection({gameKey, decks, isExpanded, onToggle, onDeckDeleted}: DeckSectionProps) {
    const gameDisplayName = GAME_DISPLAY_NAMES[gameKey] ?? gameKey.toUpperCase() //gameid/key if the good display name doesnt exist

    return (
        <div className="space-y-5">
            <button onClick={onToggle} className="w-full flex items-center gap-4 text-left group cursor-pointer">
        <span className="text-sm uppercase tracking-wide text-gray-300">
          {gameDisplayName}
        </span>
                <div className="flex-1 border-t border-white/10 group-hover:border-white/20 transition" />
                {isExpanded ? (
                    <ChevronDownIcon className="h-5 w-5 text-gray-300" />
                ) : (
                    <ChevronRightIcon className="h-5 w-5 text-gray-300" />
                )}
            </button>
            {isExpanded && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {decks.map((deck) => (
                        <DeckCard key={deck.id} deck={deck} onDeleted={onDeckDeleted} />
                    ))}
                </div>
            )}
        </div>
    )
}