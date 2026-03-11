import Card from "@/components/Card";
import CardJSON from "@/models/cards/CardJSON";
import CardPokemon from "@/models/cards/CardPokemon";

const response = await fetch("https://api.tcgdex.net/v2/en/cards/swsh3-136");
const data = await response.json();

const newCard = new CardJSON(data.id, 1, "Pokemon", data);

const newPokemon = new CardPokemon(newCard.getJSON());
console.log(newPokemon.getCardImage());

const searchResponse = await fetch("https://api.tcgdex.net/v2/en/cards?name=pikachu");
var searchResults = await searchResponse.json();
console.log(searchResults);

// Add for loop
searchResults.forEach((result: any) => {
    //const resultCard = new CardPokemon(element);
    console.log(result);
    console.log(result['id']);
});


export default function Collection() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
            <h1 className="-mt-12 text-2xl">Collection</h1>
            <br/>
            {/* Flex container for cards */}
            <div className="flex w-[75%] overflow-x-auto px-25 py-20 gap-[clamp(0.5rem,2vw,2rem)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {/* First card */}
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src="/cards/black_lotus.png" />
                    <br/>
                    <h3 className="mt-2 text-center">{/* name here */}Black Lotus</h3>
                </div>
                {/* searched cards example */}
                {searchResults.map((card: any) => (
                    <div
                        key={card.id}
                        className="flex flex-col items-center w-[15%] flex-shrink-0
                        transition-transform duration-200
                        hover:scale-105 hover:z-10"
                    >
                        <Card src={card.image + "/low.png"} />
                        <br/>
                        <h3 className="mt-2 text-center">{card.name}</h3>
                    </div>
                ))}

                {/* Second card */}
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
                <div className="flex flex-col items-center w-[15%] flex-shrink-0
                transition-transform duration-200
                hover:scale-105 hover:z-10">
                    <Card src={newPokemon.getCardImage() + "/high.png"} />
                    <br/>
                    <h3 className="mt-2 text-center">{newPokemon.getName()}</h3>
                    <p className="mt-2 text-center">{newPokemon.getDescription()}</p>
                </div>
            </div>
        </div>
    )
}
