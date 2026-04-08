import type { NextApiRequest, NextApiResponse } from "next"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
})

type DeckCard = {
    name: string
    count: number
    reason: string
    image?: string
}

type DeckResult = {
    deckName: string
    strategy: string
    cards: DeckCard[]
}

function extractJson(text: string) {
    let cleaned = text.replace(/```json/g, "")
    cleaned = cleaned.replace(/```/g, "")
    cleaned = cleaned.trim()

    const start = cleaned.indexOf("{")
    const end = cleaned.lastIndexOf("}")

    if (start < 0 || end < 0) {
        throw new Error("Gemini did not return usable JSON.")
    }

    return cleaned.substring(start, end + 1)
}

async function searchYugiohCard(cardName: string) {
    try {
        const cleanName = cardName.trim().replace(/\s+/g, " ")

        const response = await fetch(
            `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(cleanName)}`
        )

        if (!response.ok) {
            console.error("Yugioh API failed:", response.status, cardName)
            return []
        }

        const data = await response.json()
        return data?.data || []
    } catch (error) {
        console.error("Yugioh card search failed:", cardName, error)
        return []
    }
}

function chooseBestYugiohMatch(results: any[], cardName: string) {
    if (results.length === 0) {
        return null
    }

    const wantedName = cardName.trim().replace(/\s+/g, " ").toLowerCase()

    let i = 0

    while (i < results.length) {
        const card = results[i]
        const resultName = (card.name || "").trim().replace(/\s+/g, " ").toLowerCase()

        if (resultName === wantedName) {
            return card
        }

        i = i + 1
    }

    i = 0

    while (i < results.length) {
        const card = results[i]
        const resultName = (card.name || "").trim().replace(/\s+/g, " ").toLowerCase()

        if (resultName.includes(wantedName) || wantedName.includes(resultName)) {
            return card
        }

        i = i + 1
    }

    return results[0]
}

async function getYugiohCardImage(cardName: string) {
    try {
        console.log("Searching image for:", cardName)

        const results = await searchYugiohCard(cardName)

        if (results.length > 0) {
            const bestMatch = chooseBestYugiohMatch(results, cardName)
            return bestMatch?.card_images?.[0]?.image_url_small || ""
        }

        console.warn("No image found for:", cardName)
        return ""
    } catch (error) {
        console.error("Image lookup failed for:", cardName, error)
        return ""
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." })
    }

    try {
        const { prompt } = req.body

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ error: "Prompt is required." })
        }

        const fullPrompt = `
You are a pro TGC battler for YuGiOh and you are generating a deck based on what users want.

Rules:
- Only generate Yu-Gi-Oh decks.
- Only use real printed Yu-Gi-Oh cards.
- Do not make up cards.
- Build a deck based on the user's request.
- For each card, explain briefly why it belongs in the deck.
- Return JSON only.
- In the "name" field, use only the real printed card name.
- Use this format exactly:

{
  "deckName": "string",
  "strategy": "string",
  "cards": [
    {
      "name": "string",
      "count": number,
      "reason": "string"
    }
  ]
}

User request:
${prompt}
        `

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        })

        const rawText = response.text || ""
        console.log("Gemini raw response:", rawText)

        const jsonText = extractJson(rawText)
        const deck: DeckResult = JSON.parse(jsonText)

        if (!deck.deckName || !deck.strategy || !Array.isArray(deck.cards)) {
            throw new Error("Gemini returned an incorrect deck structure.")
        }

        const cardsWithImages = await Promise.all(
            deck.cards.map(async (card) => {
                try {
                    const image = await getYugiohCardImage(card.name)

                    return {
                        ...card,
                        image,
                    }
                } catch (error) {
                    console.error("Card image failed for:", card.name, error)

                    return {
                        ...card,
                        image: "",
                    }
                }
            })
        )

        return res.status(200).json({
            deck: {
                ...deck,
                cards: cardsWithImages,
            },
        })
    } catch (error: any) {
        console.error("Error???:", error)

        let message = "Failed to generate deck."

        if (error?.message) {
            message = error.message
        } else if (error?.error?.message) {
            message = error.error.message
        }

        const lowerMessage = message.toLowerCase()

        if (
            lowerMessage.includes("quota") ||
            lowerMessage.includes("resource_exhausted") ||
            lowerMessage.includes("429")
        ) {
            return res.status(429).json({
                error: "Unable to generate a deck right now, please try again later",
            })
        }

        return res.status(500).json({
            error: message,
        })
    }
}