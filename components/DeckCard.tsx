import Link from "next/link"
import type { DeckInfo } from "@/lib/deckApi"
import { deleteDeck } from "@/lib/deckApi"

const GAME_DISPLAY_NAMES: Record<string, string> = {
    pokemon: "Pokémon TCG"
}

type DeckCardProps = {
    deck: DeckInfo
    onDeleted: (deckId: string) => void
}

// This component is for the decks "cards" that will display on the decks list page
// not an actual card like a pokemon card
export default function DeckCard({ deck, onDeleted }: DeckCardProps) {
    const gameDisplayName = GAME_DISPLAY_NAMES[deck.game] ?? deck.game

    async function handleDelete() {
        const confirmed = confirm("Delete this deck?") // Should probably change this in future
        if (!confirmed) return

        const result = await deleteDeck(deck.id)

        if (result?.error) {
            alert(result.error)
            return
        }

        onDeleted(deck.id)
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-gray-800/40 shadow-xl overflow-hidden">
            <div className="h-44 bg-linear-to-b from-gray-900/40 to-gray-950/40 border-b border-white/10" />
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-lg font-semibold truncate">
                            {deck.title}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                            {gameDisplayName} • {deck.visibility}
                        </div>
                    </div>
                    <span className="rounded-full border border-white/10 bg-gray-900/40 px-3 py-1 text-xs">
                        0 cards
                    </span>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <Link href={`/decks/${deck.id}`} className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold border border-white/10 bg-blue-500/20 hover:bg-blue-500/30 transition">
                        Edit
                    </Link>
                    <button onClick={handleDelete} className="rounded-lg px-3 py-2 text-sm font-semibold border border-white/10 bg-red-500/20 hover:bg-red-500/30 transition cursor-pointer">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}