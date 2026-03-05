import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/24/solid"
import { signOut, useSession } from "next-auth/react"

export default function UserMenu() {
    const { data: session, status } = useSession()
    const loading = status === "loading"
    const [open, setOpen] = useState(false)
    const wrapRef = useRef<HTMLDivElement | null>(null)

    //should have display name but just incase use email if they dont have one, or "account"
    const displayName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Account"

    // fallback avatar from https://ui-avatars.com api
    // probably should add an option to upload a avatar in the future
    const avatarUrl = session?.user?.image ?? "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName)

    // close on outside click
    useEffect(() => {
        if (!open) return

        const onClick = (e: MouseEvent) => {
            if (!wrapRef.current) return
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }

        document.addEventListener("mousedown", onClick)
        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.removeEventListener("mousedown", onClick)
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [open])

    if (loading) return null
    if (!session) return null

    //https://react.dev/reference/react/useRef
    return (
        <div className="relative " ref={wrapRef}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-200 hover:bg-white/5 cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span className="max-w-40 truncate">{displayName}</span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-300 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true"/>

                {/* user image profile picture */}
                <img
                    src={avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                    referrerPolicy="no-referrer"
                />
            </button>

            {open && (
                <div role="menu" className="absolute right-0 mt-2 w-52 origin-top-right rounded-md bg-gray-800 py-1 outline -outline-offset-1 outline-white/10 shadow-xl"
                >
                    <Link
                        href={`/profile/${(session.user as any).id}`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                    >
                        Profile
                    </Link>

                    <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                    >
                        Settings
                    </Link>

                    <button
                        type="button"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer"
                        role="menuitem"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}