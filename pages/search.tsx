"use client";
import { useState } from "react";
import MiniCard from "@/components/MiniCard";

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
                    className="mt-1 w-full px-3 py-2 bg-white/5 text-white border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                >
                    <option value="Pokemon TCG">Pokemon TCG</option>
                </select>

                <br />

                <label>Card Name: </label>
                <input
                    type="text"
                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                    defaultValue={''}
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                />

                <input type="submit" value="Search" />
            </form>

            <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 w-full max-w-6xl mx-auto">
                {searchResults.map((result: any) => (
                    <div key={result.id} className="flex flex-col items-center text-center">
                        <MiniCard src={result.image ? result.image + "/low.png" : fallbackImage} />
                        <h3>{result.name}</h3>
                        <form>
                            <label>Add to Deck: </label>
                            <select name="deckName" className="mt-1 w-full px-3 py-2 bg-white/5 text-white border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                                <option>UPDATE THIS</option>
                            </select>
                            <br/>
                            <input type="submit" value="Submit to Deck" className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20"></input>
                        </form>
                        <br/>
                        <br/>
                    </div>
                ))}
            </div>
        </div>
    );
}