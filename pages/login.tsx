import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import AuthButton from "@/components/AuthButton"

export default function login() {
    const { data: session, status } = useSession()
    const loading = status === "loading"

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        const res = await signIn("credentials", {
            email,
            password,
            callbackUrl: "/", //go to home on login
        })

        console.log(res);

        setSubmitting(false)

        if (res?.error) {
            setError("Invalid email or password")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="-mt-36 w-full max-w-md rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-xl backdrop-blur-md">
                <div className="pb-4">
                    <h1 className="text-xl font-semibold text-white">Log in</h1>
                    <p className="mt-1 text-sm text-gray-300">
                        Access your account to manage your decks and cards.
                    </p>
                </div>

                {!session ? (
                    <>
                        {/* Email Password */}
                        <form onSubmit={handleCredentialsLogin} className="space-y-3">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full rounded-lg bg-gray-900/50 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {/* Errors for emailpass signin */}
                            {error && (
                                <div className="text-sm text-red-400">{error}</div>
                            )}

                            <button type="submit" disabled={submitting} className="w-full rounded-lg px-4 py-2 text-sm font-semibold transition border border-white/10 bg-blue-500/20 hover:bg-blue-500/30 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                {submitting ? "Signing in" : "Sign in with Email"}
                            </button>
                        </form>

                        {/* Register link */}
                        <div className="mt-3 text-sm text-gray-400 text-center">
                            Don’t have an account?{" "} {/* for spacing */}
                            <Link href="/signup" className="text-blue-400 hover:underline">
                                Register
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="my-5 flex items-center">
                            <div className="flex-1 border-t border-white/10" />
                            <span className="px-3 text-xs text-gray-400">OR</span>
                            <div className="flex-1 border-t border-white/10" />
                        </div>

                        {/* OAuth Buttons */}
                        <div className="space-y-2">
                            <AuthButton provider="github" label="Continue with GitHub" disabled={loading} />
                            <AuthButton provider="google" label="Continue with Google" disabled={loading} />
                            <AuthButton provider="apple" label="Continue with Apple" disabled={loading} />
                        </div>
                    </>
                ) : (
                    <div className="space-y-3">
                        <p>Logged in</p> {/* unreachable because of proxy but just in case */}
                    </div>
                )}
            </div>
        </div>
    )
}