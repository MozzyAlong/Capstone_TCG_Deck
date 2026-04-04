import { useState } from "react"
import {DeckVisibility} from "@/lib/deckTypes";

type ShareDeckButtonProps = {
    deckId: string
    visibility: DeckVisibility
    className?: string
}

export default function ShareDeckButton({
                                            deckId,
                                            visibility,
                                            className = "",
                                        }: ShareDeckButtonProps) {
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState(false)

    // only allow share button for public or unlisted
    if (visibility !== "public" && visibility !== "unlisted") {
        return null
    }

    async function handleShare() {
        const shareUrl = `${window.location.origin}/decks/${deckId}/public`

        try {
            await navigator.clipboard.writeText(shareUrl) // Copying public deck page url to clipboard
            setCopied(true)
            setError(false)

            setTimeout(() => setCopied(false), 1000) // message going back to share after 1 second
        } catch (err) {
            console.error("Clipboard failed:", err)
            setError(true)
        }
    }

    return (
        <button
            type="button"
            onClick={handleShare}
            className={`
                rounded-lg border border-white/10 bg-white/5 
                px-3 py-2 text-sm font-medium text-white hover:bg-white/10
                ${className}
            `}
        >
            {error ? "Failed" : copied ? "Copied" : "Share" /*should never fail but just incase*/}
        </button>
    )
}