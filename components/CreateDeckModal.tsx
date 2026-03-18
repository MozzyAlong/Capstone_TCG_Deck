import { useState } from "react"
import { createDeckApiRequest } from "@/lib/deckApi"
import {type DeckVisibility} from "@/lib/deckTypes";

type CreateDeckModalProps = {
    onClose: () => void
    onCreated: (deckId: string) => void
}

export default function CreateDeckModal({ onClose, onCreated }: CreateDeckModalProps) {
    const [title, setTitle] = useState("")
    const [game, setGame] = useState("pokemon")
    const [visibility, setVisibility] = useState<DeckVisibility>("private")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            const apiResponse = await createDeckApiRequest({title, game, visibility, description})

            if ("error" in apiResponse) {
                setErrorMessage(apiResponse.error)
                return
            }

            onCreated(apiResponse.deckId)
        } catch {
            setErrorMessage("Error creating deck") // jsut in case
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/60"
                onClick={() => !isSubmitting && onClose()}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-800 p-6 shadow-xl">
                <div className="pb-4">
                    <h2 className="text-xl font-semibold text-white">Create a deck</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Deck title"
                        maxLength={60}
                        required
                        className="w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={game}
                            onChange={(event) => setGame(event.target.value)}
                            className="w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="pokemon">Pokémon TCG</option>
                        </select>
                        <select
                            value={visibility}
                            onChange={(event) =>
                                setVisibility(event.target.value as DeckVisibility)
                            }
                            className="w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="private">Private</option>
                            <option value="unlisted">Unlisted</option>
                            <option value="public">Public</option>
                        </select>
                    </div>
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Description (optional)"
                        maxLength={240}
                        rows={3}
                        className="w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errorMessage && (
                        <div className="text-sm text-red-400">{errorMessage}</div>
                    )}
                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-semibold transition border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200  cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg px-4 py-2 text-sm font-semibold transition border border-white/10 bg-blue-500/20 hover:bg-blue-500/30 cursor-pointer text-white"
                        >
                            {isSubmitting ? "Creating" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}