import { useState } from "react"
import { createDeckApiRequest, replaceDeckCards } from "@/lib/deckApi"
import { useRouter } from "next/router"

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

export default function DeckCreationAI() {
    const [idea, setIdea] = useState("")
    const router = useRouter()
    const [game, setGame] = useState("pokemon")
    const [makingDeck, setMakingDeck] = useState(false)
    const [message, setMessage] = useState("")
    const [deckData, setDeckData] = useState<DeckInfo | null>(null)
    const [brokenCards, setBrokenCards] = useState<string[]>([])

    async function handleGenerate() {
        if (!idea.trim()) {
            setMessage("Type in a deck idea first.")
            return
        }

        setMakingDeck(true)
        setMessage("")
        setDeckData(null)
        setBrokenCards([])

        let apiPath = ""

        if (game === "pokemon") {
            apiPath = "/api/APIbuild"
        } else if (game === "yugioh") {
            apiPath = "/api/YuGiOhDeck"
        } else if (game === "mtg") {
            apiPath = "/api/build-mtg-deck"
        }

        console.log("Selected game:", game)
        console.log("Using API path:", apiPath)

        try {
            const response = await fetch(apiPath, {
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

                setMakingDeck(false)
                return
            }

            setDeckData(result.deck)
        } catch (error) {
            console.log("Fetch error:", error)
            setMessage("Could not build a deck.")
        }

        setMakingDeck(false)
    }

    function markBrokenImage(cardName: string) {
        setBrokenCards((oldList) => {
            if (oldList.includes(cardName)) {
                return oldList
            }

            return [...oldList, cardName]
        })
    }

async function handleAddToDecks() {
    if (!deckData) {
        return
    }

    try {
        const createResult = await createDeckApiRequest({
            title: deckData.deckName,
            game,
        } as any)

        if (!("deckId" in createResult)) {
            setMessage(createResult.error || "Could not save deck.")
            return
        }

        const formattedCards = deckData.cards.map((card, index) => ({
            id: `${card.name}-${index}`,
            name: card.name,
            quantity: card.count,
            image: card.image?.replace("/low.webp", "") || "",
            raw: {
                reason: card.reason,
            },
        })) as any

        const replaceResult = await replaceDeckCards(createResult.deckId, formattedCards)

        if (!("cards" in replaceResult)) {
            setMessage(replaceResult.error || "Could not save deck cards.")
            return
        }

        router.push("/decks")
    } catch (error) {
        console.log("Save deck error:", error)
        setMessage("failiure to save the deck.")
    }
}

    return (
        <main className="flex min-h-screen flex-col items-center px-6 py-16 text-center">
            <h1 className="mb-8 text-3xl font-semibold">Create a TCG deck with AI</h1>

            <div className="flex w-full max-w-2xl gap-3">
                <input
                    type="text"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Example: fast dragon deck with strong attacks"
                    className="w-full rounded-md border border-gray-300 bg-transparent px-4 py-3 text-white shadow-sm outline-none"
                />

                <select
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    className="rounded-md border border-gray-300 bg-transparent px-4 py-3 text-white"
                >
                    <option value="pokemon" className="text-black">Pokémon</option>
                    <option value="yugioh" className="text-black">Yu-Gi-Oh</option>
                    <option value="mtg" className="text-black">Magic: The Gathering</option>
                </select>

                <button
                    onClick={handleGenerate}
                    disabled={makingDeck}
                    className="rounded-md bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {makingDeck ? "Generating..." : "Generate"}
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
        const canShowImage = card.image && !brokenCards.includes(card.name)

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
                        onError={() => markBrokenImage(card.name)}
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

                <div className="mt-8 flex justify-center">
                <button
    onClick={handleAddToDecks}
        className="rounded-md bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                    Add to Decks
                    </button>
                    </div>
                </div>
            )}
        </main>
    )
}