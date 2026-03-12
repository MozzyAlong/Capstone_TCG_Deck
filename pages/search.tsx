"use client";
import { useState } from "react";
import Card from "@/components/Card";

const fallbackImage = "https://www.uvdesigns.ca/wp-content/themes/uvdesigns2025/img/no_image.jpg";

export default function Search() {

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [cardName, setCardName] = useState("");
    const [gameType, setGameType] = useState("Pokemon TCG");

    async function search(e: React.FormEvent) {
        e.preventDefault();

        // Only run search if Pokemon TCG is selected
        if (gameType == "Pokemon TCG") {
            const response = await fetch(
                `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(cardName)}`
            );
    
            const data = await response.json();
            setSearchResults(data);
        }

        
    }

    return (
        <div className="flex items-center justify-center min-h-screen flex-col">
            <h1 className="text-2xl mb-4">Search</h1>

            <form onSubmit={search}>
                <label>Select Game: </label>
                <select
                    name="gameType"
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                >
                    <option value="Pokemon TCG">Pokemon TCG</option>
                </select>

                <br />

                <label>Card Name: </label>
                <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                />

                <input type="submit" value="Search" />
            </form>

            <div className="mt-6">
                {searchResults.map((result: any) => (
                    <div key={result.id}>
                        <Card src={result.image ? result.image + "/low.png" : fallbackImage} />
                        {result.name}
                        <form>
                            <label>Add to Deck: </label>
                            <select name="deckName">
                                <option>UPDATE THIS TO LIST USER DECKS</option>
                            </select>
                            <input type="submit" value="Add to Deck"></input>
                        </form>
                        <br/>
                        <br/>
                    </div>
                ))}
            </div>
        </div>
    );
}