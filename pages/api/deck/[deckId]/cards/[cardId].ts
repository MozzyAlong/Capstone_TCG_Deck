import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/db"
import {DeckCard} from "@/lib/deckTypes";

//getting the users deck only if owned, should probably move this mehtod somewhere else
async function getOwnedDeck(req: NextApiRequest, deckId: string) {
    const sessionToken = await getToken({req, secret: process.env.NEXTAUTH_SECRET})

    // validate email
    if (!sessionToken?.email || typeof sessionToken.email !== "string") {
        return { error: "Unauthorized" as const }
    }

    if (!ObjectId.isValid(deckId)) {
        return { error: "Invalid deck id" as const }
    }

    const client = await clientPromise
    const db = client.db()

    const usersCollection = db.collection("users")
    const deckCollection = db.collection("decks")

    const user = await usersCollection.findOne({ email: sessionToken.email })

    // verify user is in the db
    if (!user) {
        return { error: "User not found" as const }
    }

    const deckObjectId = new ObjectId(deckId)

    //make sure the user owns the deck to edit
    const ownedDeckQuery = {
        _id: deckObjectId,
        ownerId: user._id,
    }

    const deck = await deckCollection.findOne(ownedDeckQuery)

    if (!deck) {
        return { error: "Deck not found" as const }
    }

    return {
        deckCollection,
        deck,
        ownedDeckQuery,
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { deckId, cardId } = req.query

    // making sure the ids are string, typescript is very annoying sometimes
    if (typeof deckId !== "string" || typeof cardId !== "string") {
        return res.status(400).json({ error: "Invalid parameters" })
    }

    const ownedDeckResult = await getOwnedDeck(req, deckId)

    if ("error" in ownedDeckResult) {
        let status = 404;
        if (ownedDeckResult.error === "Unauthorized") {
            status = 400
        }

        return res.status(status).json({ error: ownedDeckResult.error })
    }

    const { deckCollection, deck, ownedDeckQuery } = ownedDeckResult

    // cards in deck before any modification
    let existingCards: DeckCard[]
    if (Array.isArray(deck.cards)) {
        existingCards = deck.cards
    } else {
        existingCards = []
    }

    // Check if the card is in the deck already (for quantity modification mainly)
    const existingCard = existingCards.find((card) => card.id === cardId)

    if (req.method === "GET") {
        if (!existingCard) {
            return res.status(404).json({ error: "Card not found in deck" })
        }

        return res.status(200).json({ card: existingCard })
    }

    if (req.method === "PATCH") {
        if (!existingCard) {
            return res.status(404).json({ error: "Card not found in deck" })
        }

        const newQuantity = Number(req.body.quantity)

        if (newQuantity < 1) {
            return res.status(400).json({ error: "Quantity must be at least 1" })
        }

        // card with updated quantity
        const updatedCard: DeckCard = {
            ...existingCard,
            quantity: newQuantity,
        }

        //updated cards in deck but with the updated card
        const nextCards = existingCards.map((card) =>
            card.id === cardId ? updatedCard : card
        )

        const updatedAt = new Date()

        //https://www.mongodb.com/docs/manual/reference/operator/update/set/ basically updating the cards set of the deck
        // and not overwriting the other fields
        await deckCollection.updateOne(ownedDeckQuery, {
            $set: {
                cards: nextCards,
                updatedAt,
            },
        })

        return res.status(200).json({
            success: true,
            card: updatedCard,
            updatedAt,
        })
    }

    if (req.method === "DELETE") {
        if (!existingCard) {
            return res.status(404).json({ error: "Card not found in deck" })
        }

        const newCardList = existingCards.filter((card) => card.id !== cardId)
        const updatedAt = new Date()

        await deckCollection.updateOne(ownedDeckQuery, {
            $set: {
                cards: newCardList,
                updatedAt,
            },
        })

        return res.status(200).json({
            success: true,
            removedCard: existingCard,
            updatedAt,
        })
    }

    res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
    return res.status(405).json({ error: "Method not allowed" })
}