import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import UserMenu from "@/components/UserMenu"

export default function Navbar({ links }: { links: string[] }) {
    const router = useRouter()
    const { pathname } = router
    const { data: session, status } = useSession()

    const loading = status === "loading"

    return (
        <nav className="sticky top-0 z-50 bg-gray-800 border-b border-white/10" style={{ zIndex: 99999 }}>
            <div className="flex h-16 items-center justify-between px-4">
                <div className="flex gap-4">
                    {links.map((link) => {
                        const href =
                            link === "CyberTCG"
                                ? "/"
                                : link === "Discover"
                                    ? "/decks/discover"
                                    : link === "Create Deck AI"
                                        ? "/DeckCreationAI"
                                    : `/${link.toLowerCase()}`
                        const isActive = pathname === href

                        return (
                            <Link
                                key={href}
                                className={`rounded-md px-3 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white  
                                            ${isActive ? "bg-gray-950/50 text-white" : ""}`}
                                href={href}
                                aria-current={isActive ? "page" : undefined}
                            >
                                {link}
                            </Link>
                        )
                    })}
                </div>

                <div>
                    {loading ? null : session ? (
                        <UserMenu />
                    ) : (
                        <Link href="/login" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-200">
                            Log in
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}