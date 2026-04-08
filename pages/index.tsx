import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";


export default function HomePage() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="-mt-48 text-center">
                <div className="flex items-center justify-center gap-0">
                    <img
                        src="/logo.png"
                        alt="CyberTCG logo"
                        className="w-28 h-28 md:w-40 md:h-40 translate-y-2"
                    />

                    <h1 className="md:text-8xl text-6xl font-semibold tracking-wide">
                        CyberTCG
                    </h1>
                </div>
                <p className="md:text-xl text-base pb-2">The best place for TCG deck building</p>
                <Link
                    className="inline-flex gap-1 bg-blue-500 rounded-md px-8 pr-6 py-2 mt-1 md:text-lg text-sm font-medium text-gray-300 transition hover:bg-blue-400 hover:text-white"
                    href="/decks/discover">
                    Discover Decks
                    <ArrowUpRightIcon className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}

