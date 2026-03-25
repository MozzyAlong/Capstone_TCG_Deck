eexport default function About() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
            
            <h1 className="text-3xl font-semibold mb-6">About Cybernetic TGC.IO</h1>

            <p className="max-w-2xl mb-6">
                Cybernetic TGC.IO is a site created by 4 students whose goal was to build a platform 
                for the TGC community to create and customize their own decks with the assistance of AI. 
                Whether it’s helping beginners understand how to construct a deck or providing new 
                perspectives on already built decks, the platform is designed to support all levels of players.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Card Support</h2>

            <p className="max-w-2xl mb-6">
                Cybernetic TGC.IO supports three of the most relevant trading card games in the community. 
                The most popular is Pokémon, alongside two of the most competitive card games: 
                Magic: The Gathering and Yu-Gi-Oh. The platform helps users understand how cards work 
                within their decks, provides ratings, and even guides users on where they can purchase 
                physical copies for their collections.
            </p>

            <h3 className="text-2xl font-semibold mb-4">AI Integration</h3>

            <p className="max-w-2xl">
                The AI chatbot integrated into Cybernetic TGC.IO is ChatGPT. During the deck-building process, 
                the AI provides real-time suggestions, recommends strategies, and offers improvements based 
                on the user’s current deck. This allows users to experiment with new ideas and refine their 
                builds with intelligent assistance.
            </p>

        </main>
    );
}
