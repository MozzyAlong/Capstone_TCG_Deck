import { useState } from "react"

type CardInfo = {
    name: string
    count: number
    reason: string
    image?: string
}

type DeckInfo = {
    deckName: string
    strategy: string
    cards: CardInfo[]
}

// Prompts for AI creation
export default function DeckCreationAI() {
    const [idea, setIdea] = useState("")
    const [makingDeck, setMakingDeck] = useState(false)
    const [message, setMessage] = useState("")
    const [deckData, setDeckData] = useState<DeckInfo | null>(null)
    const [brokenCards, DamagedCards] = useState<string[]>([])

    // Fetch card image from TCG API
    async function handleGenerate() {
        if (!idea.trim()) {
            setMessage("Enter a deck idea!")
            return
        }

        // Reset state for new generation
        setMakingDeck(true)
        setMessage("")
        setDeckData(null)
        DamagedCards([])

        try {
            const response = await fetch("/api/APIbuild", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: idea }),
            })

            const result = await response.json()

            if (!response.ok) {
                if (result.error) {
                    setMessage(result.error)
                } else {
                    setMessage("Could not build a deck.")
                }
                return
            }

            setDeckData(result.deck)
        } catch (error) {
            setMessage("Unable to create a Deck.")
            console.log(error)
        }

        setMakingDeck(false)
    }

    //
    function DamagedImage(cardName: string) {
        DamagedCards((oldList) => {
            if (oldList.includes(cardName)) {
                return oldList
            }

            return [...oldList, cardName]
        })
    }

    return (
        <main className="flex min-h-screen flex-col items-center px-6 py-16 text-center">
            <h1 className="mb-8 text-3xl font-semibold">Create a TCG deck with AI's help</h1>

            <div className="flex w-full max-w-xl gap-3">
                <input
                    type="text"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Example: fast dragon deck with strong attacks"
                    className="w-full rounded-md border border-gray-300 bg-transparent px-4 py-3 text-white shadow-sm outline-none"
                />

                <button
                    onClick={handleGenerate}
                    disabled={makingDeck}
                    className="rounded-md bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {makingDeck ? "Creating Your Deck..." : "Generate"}
                </button>
            </div>

            {message && (
                <p className="mt-4 text-red-400">{message}</p>
            )}

            {deckData && (
                <div className="mt-10 w-full max-w-4xl rounded-lg border border-gray-700 bg-gray-900 p-6 text-left text-white">
                    <h2 className="mb-3 text-2xl font-semibold">{deckData.deckName}</h2>

                    <p className="mb-6 text-gray-300">{deckData.strategy}</p>

                    <div className="grid gap-4 md:grid-cols-2">
                        {deckData.cards.map((card, index) => {
                            const canShowImage =
                                card.image && !brokenCards.includes(card.name)

                            return (
                                <div
                                    key={card.name + index}
                                    className="flex gap-4 rounded-md border border-gray-700 p-4"
                                >
                                    {canShowImage ? (
                                        <img
                                            src={card.image}
                                            alt={card.name}
                                            className="h-32 w-24 rounded object-cover"
                                            onError={() => DamagedImage(card.name)}
                                        />
                                    ) : (
                                        <div className="flex h-32 w-24 items-center justify-center rounded bg-gray-800 text-xs text-gray-400">
                                            No image
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-semibold">
                                            {card.count}x {card.name}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-300">
                                            {card.reason}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </main>
    )
}