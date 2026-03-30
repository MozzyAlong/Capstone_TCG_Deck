import type { NextApiRequest, NextApiResponse } from "next"
import { GoogleGenAI } from "@google/genai"

// API key
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
})

//
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

async function getCardImage(cardName: string) {
    try {
        console.log("Searching image for:", cardName)

        let cleanName = cardName.trim()
        let setName = ""

        const bracketMatch = cleanName.match(/^(.*?)\s*\((.*?)\)\s*$/)
        if (bracketMatch) {
            cleanName = bracketMatch[1].trim()
            setName = bracketMatch[2].trim()
        }

        cleanName = cleanName.replace(/\s+/g, " ").replace(/[–—]/g, "-").trim()
        setName = setName.replace(/\s+/g, " ").replace(/[–—]/g, "-").trim()

        let response
        let data
        let results = []

        if (setName) {
            const firstQuery = `name:"${cleanName}" set.name:"${setName}"`
            response = await fetch(
                `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(firstQuery)}&pageSize=10&select=id,name,number,set,images`,
                {
                    headers: {
                        ...(process.env.POKEMONTCG_API_KEY
                            ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY }
                            : {}),
                    },
                }
            )

            if (response.ok) {
                data = await response.json()
                results = data?.data || []

                let i = 0
                while (i < results.length) {
                    const current = results[i]
                    const resultName = (current.name || "").replace(/\s+/g, " ").replace(/[–—]/g, "-").trim().toLowerCase()
                    const resultSet = (current.set?.name || "").replace(/\s+/g, " ").replace(/[–—]/g, "-").trim().toLowerCase()

                    if (resultName === cleanName.toLowerCase() && resultSet === setName.toLowerCase()) {
                        return current.images?.small || ""
                    }

                    i = i + 1
                }

                if (results.length > 0) {
                    return results[0].images?.small || ""
                }
            }
        }

        const secondQuery = `name:"${cleanName}"`
        response = await fetch(
            `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(secondQuery)}&pageSize=10&select=id,name,number,set,images`,
            {
                headers: {
                    ...(process.env.POKEMONTCG_API_KEY
                        ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY }
                        : {}),
                },
            }
        )

        if (response.ok) {
            data = await response.json()
            results = data?.data || []

            let i = 0
            while (i < results.length) {
                const current = results[i]
                const resultName = (current.name || "").replace(/\s+/g, " ").replace(/[–—]/g, "-").trim().toLowerCase()

                if (resultName === cleanName.toLowerCase()) {
                    return current.images?.small || ""
                }

                i = i + 1
            }

            if (results.length > 0) {
                return results[0].images?.small || ""
            }
        }

        const thirdQuery = `name:${cleanName}`
        response = await fetch(
            `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(thirdQuery)}&pageSize=10&select=id,name,number,set,images`,
            {
                headers: {
                    ...(process.env.POKEMONTCG_API_KEY
                        ? { "X-Api-Key": process.env.POKEMONTCG_API_KEY }
                        : {}),
                },
            }
        )

        if (response.ok) {
            data = await response.json()
            results = data?.data || []

            if (results.length > 0) {
                return results[0].images?.small || ""
            }
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

    const prompt = req.body?.prompt

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt is required." })
    }

    try {
        const fullPrompt = `
Build a Pokémon TCG deck from the user's idea.

Rules:
- Only use real Pokémon cards.
- Do not make up cards.
- Give a short reason for each card.
- Return JSON only.
- In the name field, use the real printed card name only.
- Do not put set names in brackets.

Use this format:

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

        let rawText = response.text || ""
        console.log("Gemini raw response:", rawText)

        rawText = rawText.replace(/```json/g, "")
        rawText = rawText.replace(/```/g, "")
        rawText = rawText.trim()

        const start = rawText.indexOf("{")
        const end = rawText.lastIndexOf("}")

        if (start === -1 || end === -1) {
            throw new Error("Gemini did not return valid JSON.")
        }

        const jsonText = rawText.substring(start, end + 1)
        const deck: DeckResult = JSON.parse(jsonText)

        if (!deck.deckName || !deck.strategy || !Array.isArray(deck.cards)) {
            throw new Error("Deck data is missing something.")
        }

        const updatedCards = []

        for (const card of deck.cards) {
            const image = await getCardImage(card.name)

            updatedCards.push({
                ...card,
                image,
            })
        }

        return res.status(200).json({
            deck: {
                ...deck,
                cards: updatedCards,
            },
        })
    } catch (error: any) {
        console.error("Build deck error:", error)

        let message = "Failed to generate deck."

        if (error && error.message) {
            message = error.message
        }

        const lower = message.toLowerCase()

        if (
            lower.includes("quota") ||
            lower.includes("resource_exhausted") ||
            lower.includes("429")
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