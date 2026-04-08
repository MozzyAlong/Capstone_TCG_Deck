export default function About() {
    return (
        <main className="min-h-screen text-white">
            <div className="mx-auto max-w-5xl px-6 pb-16 pt-16">
                <div className="rounded-3xl border border-white/10 bg-gray-900/60 md:p-12">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                            Deck building with AI, built for TCG players
                        </h1>

                        <p className="mt-6 text-base leading-8 text-white md:text-lg">
                            CyberTCG is a site created by 4 students whose goal was to build a platform
                            for the TGC community to create and customize their own decks with the assistance of AI.
                            Whether it’s helping beginners understand how to construct a deck or providing new
                            perspectives on already built decks, the platform is designed to support all levels of players.
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <section className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
                        <h2 className="text-xl font-semibold text-white">Card Support</h2>
                        <p className="mt-3 text-sm leading-7 text-white">
                            CyberTCG supports three of the most relevant trading card games in the community.
                            The most popular is Pokémon, alongside two of the most competitive card games:
                            Magic: The Gathering and Yu-Gi-Oh. The platform helps users understand how cards work
                            within their decks, provides ratings, and even guides users on where they can purchase
                            physical copies for their collections.
                        </p>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
                        <h2 className="text-xl font-semibold text-white">AI integration</h2>
                        <p className="mt-3 text-sm leading-7 text-white">
                            The AI chatbot integrated into CyberTGC is Google Gemini. During the deck-building process,
                            the AI provides real-time suggestions, recommends strategies, and offers improvements based
                            on the user’s current deck. This allows users to experiment with new ideas and refine their
                            builds with intelligent assistance.
                        </p>
                    </section>
                </div>
                <section>
                    <p className="mt-4 mb-1 text-sm text-gray-400">Attribution</p>
                    <p className="text-xs text-gray-400">These materials were used in combination, and with manual tweaks to create the CyberTCG logo.</p>
                    <ul>
                        <li className="text-xs text-gray-400">AI by Christelle Mozzati from <a href="https://thenounproject.com/browse/icons/term/ai/" target="_blank" title="AI Icons">Noun Project</a> (CC BY 3.0)</li>
                        <li className="text-xs text-gray-400" >Card by Wahyu Adam from <a href="https://thenounproject.com/browse/icons/term/card/" target="_blank" title="Card Icons">Noun Project</a> (CC BY 3.0)</li>
                    </ul>
                </section>

            </div>
        </main>
    )
}