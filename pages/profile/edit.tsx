import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

type MeResponse = {
    user: {
        id: string
        name: string | null
        image: string | null
        bio: string | null
    }
}

export default function EditProfile() {
    const router = useRouter()
    const { data: session, status } = useSession()

    // user info
    const [userId, setUserId] = useState<string>("")
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [serverImage, setServerImage] = useState<string | null>(null)

    // page info
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (status !== "authenticated") return

        const load = async () => {
            setLoading(true)
            setError(null)

            const res = await fetch("/api/profile/me")
            const data = (await res.json().catch(() => null)) as MeResponse | null

            if (!res.ok || !data?.user) {
                setError("Failed to load profile.")
                setLoading(false)
                return
            }

            setUserId(data.user.id)
            setName(data.user.name ?? "")
            setBio(data.user.bio ?? "")
            setServerImage(data.user.image ?? null)
            setLoading(false)
        }

        load()
    }, [status])

    if (status === "loading") return null
    if (status !== "authenticated") return null

    const displayName = name?.trim() || session.user?.name || session.user?.email?.split("@")[0] || "Unnamed User"

    const avatarUrl = serverImage ?? session.user?.image ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1f2937&color=ffffff`

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        const res = await fetch("/api/profile/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name.trim(),
                bio: bio.trim(),
            }),
        })

        const data = await res.json().catch(() => ({}))
        setSaving(false)

        if (!res.ok) {
            setError(data?.error || "Failed to save.")
            return
        }

        router.push(`/profile/${userId}`)
    }

    return (
        <div className="min-h-screen text-white">
            <div className="mx-auto max-w-4xl px-6 pt-10 pb-8 flex items-center gap-6">
                <img
                    src={avatarUrl}
                    alt=""
                    className="h-24 w-24 rounded-full bg-gray-700"
                    referrerPolicy="no-referrer"
                />

                <div className="flex-1">
                    <h1 className="text-sm uppercase tracking-wide text-gray-400 mb-2">
                        Name
                    </h1>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={60}
                        placeholder="Your name"
                        className="w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {userId && (
                        <Link
                            href={`/profile/${userId}`}
                            className="mt-3 inline-block text-sm text-blue-400 hover:underline"
                        >
                            View public profile
                        </Link>
                    )}
                </div>
            </div>

            {/* divider */}
            <div className="mx-auto max-w-4xl px-6">
                <div className="border-t border-white/10" />
            </div>

            <div className="mx-auto max-w-4xl px-6 py-10">
                {loading ? (
                    <div className="text-gray-300">Loading…</div>
                ) : (
                    <form onSubmit={onSave} className="space-y-8">
                        {/* bio */}
                        <div>
                            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">
                                Bio
                            </h2>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={280}
                                placeholder="Write a short bio..."
                                className="w-full min-h-30 rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="mt-1 text-xs text-gray-400">
                                {bio.length}/280
                            </div>
                        </div>

                        {error && <div className="text-sm text-red-400">{error}</div>}

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg px-4 py-2 text-sm font-semibold transition border border-white/10 bg-blue-500/20 hover:bg-blue-500/30 cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saving" : "Save changes"}
                            </button>

                            {userId && (
                                <Link
                                    href={`/profile/${userId}`}
                                    className="rounded-lg px-4 py-2 text-sm font-semibold transition border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200"
                                >
                                    Cancel
                                </Link>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}