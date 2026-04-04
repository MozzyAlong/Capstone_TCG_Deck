/**
 * @file /api/deck/[deckId]/cards
 * @description Handles interactions on all cards in a users deck.
 * GET: Gets all cards in the deck
 * PUT: Replaces the card list in the deck
 * POST: Adds a new card to the deck or updates its quantity if its already in the deck
 *
 * @author Cole de Ruiter
 * @since 2026-04-04
 */
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"
import { DeckCard } from "@/lib/deckTypes";

// needed so typescript doesnt get mad
type PutCardsBody = {
    cards?: DeckCard[]
}

type PostCardBody = {
    card?: DeckCard
}

// Needed because some values are "unknown" for some reason cause typescript
function trimString(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}

function isPositive(value: unknown): boolean {
    return Number.isInteger(value) && Number(value) > 0
}

function cleanDeckCard(input: unknown): DeckCard | null {
    if (!input || typeof input !== "object") return null

    const card = input as Record<string, unknown>

    const id = trimString(card.id)
    const name = trimString(card.name)
    const quantity = Number(card.quantity)

    // sometimes the apit is not returning card pictures
    const image =
        typeof card.image === "string" && card.image.trim().length > 0
            ? card.image.trim()
            : null

    if (!id) return null
    if (!name) return null
    if (!isPositive(quantity)) return null

    return {
        id,
        name,
        image,
        quantity,
        raw: card.raw ?? null,
    }
}

function cleanCardsArray(input: unknown): DeckCard[] | null {
    if (!Array.isArray(input)) return null

    const cards: DeckCard[] = []

    for (const item of input) {
        const card = cleanDeckCard(item)
        if (!card) return null

        cards.push(card)
    }

    return cards
}

// basically checking userid & deckid are valid
async function getAuthorizedDeck(req: NextApiRequest, res: NextApiResponse, deckId: string) {
    if (!ObjectId.isValid(deckId)) {
        res.status(400).json({ error: "Invalid deck id" })
        return null
    }

    const session = await getServerSession(req, res, authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" })
        return null
    }

    if (!ObjectId.isValid(userId)) {
        res.status(400).json({ error: "Invalid user id" })
        return null
    }

    const client = await clientPromise
    const db = client.db()

    const deckObjectId = new ObjectId(deckId)
    const ownerObjectId = new ObjectId(userId)

    // checking the user owns this deck
    const deck = await db.collection("decks").findOne({
        _id: deckObjectId,
        ownerId: ownerObjectId,
    })

    if (!deck) {
        res.status(404).json({ error: "Deck not found" })
        return null
    }

    return {
        db,
        deck,
        deckObjectId,
        ownerObjectId,
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { deckId } = req.query

    if (typeof deckId !== "string") {
        return res.status(400).json({ error: "Invalid deck id" })
    }

    const Deck = await getAuthorizedDeck(req, res, deckId)
    if (!Deck) return

    const { db, deck, deckObjectId, ownerObjectId } = Deck

    if (req.method === "GET") {
        const cards = Array.isArray((deck as any).cards) ? (deck as any).cards : []

        return res.status(200).json({
            cards,
            count: cards.length,
        })
    }

    if (req.method === "PUT") {
        const body = (req.body ?? {}) as PutCardsBody
        const cards = cleanCardsArray(body.cards)

        if (!cards) {
            return res.status(400).json({
                error: "Invalid cards",
            })
        }

        const now = new Date()

        await db.collection("decks").updateOne(
            {
                _id: deckObjectId,
                ownerId: ownerObjectId,
            },
            {
                $set: {
                    cards,
                    updatedAt: now,
                },
            }
        )

        return res.status(200).json({
            success: true,
            cards,
            count: cards.length,
            updatedAt: now,
        })
    }

    if (req.method === "POST") {
        const body = (req.body ?? {}) as PostCardBody
        const newCard = cleanDeckCard(body.card)

        if (!newCard) {
            return res.status(400).json({
                error: "Invalid card",
            })
        }

        let currentCards: DeckCard[] = []

        if (Array.isArray(deck.cards)) {
            currentCards = [...deck.cards]
        }

        const existingIndex = currentCards.findIndex((c) => c.id === newCard.id)

        if (existingIndex >= 0) {
            currentCards[existingIndex] = {
                ...currentCards[existingIndex],
                name: newCard.name,
                image: newCard.image,
                quantity: Number(currentCards[existingIndex].quantity || 0) + newCard.quantity,
                raw: newCard.raw,
            }
        } else {
            currentCards.push(newCard)
        }

        const now = new Date()

        await db.collection("decks").updateOne(
            {
                _id: deckObjectId,
                ownerId: ownerObjectId,
            },
            {
                $set: {
                    cards: currentCards,
                    updatedAt: now,
                },
            }
        )

        return res.status(200).json({
            success: true,
            cards: currentCards,
            count: currentCards.length,
            updatedAt: now,
        })
    }

    return res.status(405).json({ error: "not allowed" })
}