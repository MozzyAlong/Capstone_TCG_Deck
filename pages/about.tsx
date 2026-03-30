export default function About() {
    return (
        <main className="min-h-screen px-6 py-16 text-center">
            <h1 className="mb-12 text-3xl font-semibold">About Cybernetic TGC.IO</h1>

            <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold">About Cybernetic TGC.IO</h2>

                    <p>
                        Cybernetic TGC.IO is a site created by 4 students whose goal was to build a platform
                        for the TGC community to create and customize their own decks with the assistance of AI.
                        Whether it’s helping beginners understand how to construct a deck or providing new
                        perspectives on already built decks, the platform is designed to support all levels of players.
                    </p>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold">Card Support</h2>

                    <p>
                        Cybernetic TGC.IO currently supports the most relevant trading card games in the community, that of course is pokemon.
                        The platform helps users understand how cards work within their decks, provides ratings, and even guides users on where they can purchase
                        physical copies for their collections.
                    </p>
                </div>

                <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold">AI Integration</h2>

                    <p>
                        The AI chatbot integrated into Cybernetic TGC.IO is Gemini. During the deck-building process,
                        the AI provides real-time suggestions, recommends strategies, and offers improvements based
                        on the user’s current deck. This allows users to experiment with new ideas and refine their
                        builds with intelligent assistance.
                    </p>
                </div>
            </div>
        </main>
    )
}