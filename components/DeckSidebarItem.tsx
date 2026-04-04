import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline"
import { DeckCard } from "@/lib/deckTypes"

interface Props {
    card: DeckCard
    imageSrc: string
    subtitle: string
    numberLabel: string
    onDecrease: () => void
    onIncrease: () => void
}

export default function DeckSidebarItem({
                                            card,
                                            imageSrc,
                                            subtitle,
                                            numberLabel,
                                            onDecrease,
                                            onIncrease,
                                        }: Props) {
    return (
        <div className="flex gap-3 rounded-lg border border-white/10 bg-black/10 p-3">
            <img
                src={imageSrc}
                alt={card.name}
                className="h-20 w-14 rounded-lg object-cover"
            />

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white">
                            {card.name}
                        </h3>
                        <p className="mt-1 truncate text-xs text-gray-400">
                            {subtitle} {/* currently for set title*/}
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-400">
                        {numberLabel}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onDecrease}
                            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-1 text-white hover:bg-white/10 disabled:cursor-not-allowed"
                            aria-label={`Decrease ${card.name}`}
                        >
                            <MinusIcon className="h-4 w-4" />
                        </button>
                        <div className="min-w-6 text-center text-sm font-semibold text-white">
                            {card.quantity}
                        </div>
                        <button
                            onClick={onIncrease}
                            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-1 text-white hover:bg-white/10 disabled:cursor-not-allowed"
                            aria-label={`increase ${card.name}`}
                        >
                            <PlusIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
