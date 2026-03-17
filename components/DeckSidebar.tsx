import { DeckCard } from "@/lib/deckTypes"
import DeckListItem from "@/components/DeckSidebarItem"

interface Props {
    cards: DeckCard[]
    totalCardsInDeck: number
    getDeckCardImage: (card: DeckCard) => string
    getDeckCardSubtitle: (card: DeckCard) => string
    getDeckCardNumber: (card: DeckCard) => string
    onDecreaseQuantity: (card: DeckCard) => void
    onIncreaseQuantity: (card: DeckCard) => void
}
// This component is for the deck sidebar that shows the cards in it and their quantities based on the figma design
export default function DeckSidebar({
                                        cards,
                                        totalCardsInDeck,
                                        getDeckCardImage,
                                        getDeckCardSubtitle,
                                        getDeckCardNumber,
                                        onDecreaseQuantity,
                                        onIncreaseQuantity,
                                    }: Props) {
    return (
        <aside className="min-w-0">
            <div className="sticky top-6 rounded-2xl border border-white/10 bg-gray-900/60 p-5 shadow-2xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold">Current Deck</h2>
                    <div className="text-right text-sm text-gray-400">
                        <div>
                            {cards.length} unique card{cards.length === 1 ? "" : "s"}
                        </div>
                        <div>{totalCardsInDeck} total</div>
                    </div>
                </div>

                {cards.length === 0 ? (
                    <div className="rounded-lg border-white/10 bg-black/10 p-8 text-center">
                        <p className="text-sm font-medium text-gray-400">
                            No cards added yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cards.map((card) => (
                            <DeckListItem
                                key={card.id}
                                card={card}
                                imageSrc={getDeckCardImage(card)}
                                subtitle={getDeckCardSubtitle(card)}
                                numberLabel={getDeckCardNumber(card)}
                                onDecrease={() => onDecreaseQuantity(card)} // this is kinda ugly but it works
                                onIncrease={() => onIncreaseQuantity(card)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </aside>
    )
}
