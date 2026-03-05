    import NextAuth, { type NextAuthOptions } from "next-auth"
    import GitHubProvider from "next-auth/providers/github"
    import GoogleProvider from "next-auth/providers/google"
    import AppleProvider from "next-auth/providers/apple"
    import CredentialsProvider from "next-auth/providers/credentials"
    import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
    import clientPromise from "@/lib/db"
    import bcrypt from "bcryptjs"

    export const authOptions: NextAuthOptions = {
        adapter: MongoDBAdapter(clientPromise),

        providers: [
            // Email Password login
            CredentialsProvider({
                name: "Email & Password",
                credentials: {
                    email: { label: "Email", type: "email", placeholder: "you@example.com" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    const email = credentials?.email?.trim().toLowerCase()
                    const password = credentials?.password

                    if (!email || !password) return null

                    const client = await clientPromise
                    const db = client.db()

                    const user = await db.collection("users").findOne({ email })
                    if (!user?.passwordHash) return null

                    const ok = await bcrypt.compare(password, user.passwordHash)
                    if (!ok) return null

                    return {
                        id: user._id.toString(),
                        name: user.name ?? null,
                        email: user.email,
                        image: user.image ?? null,
                    }
                },
            }),

            // OAuth
            GitHubProvider({
                clientId: process.env.GITHUB_ID!,
                clientSecret: process.env.GITHUB_SECRET!,
            }),

            GoogleProvider({
                clientId: process.env.GOOGLE_ID!,
                clientSecret: process.env.GOOGLE_SECRET!,
            }),

            AppleProvider({
                clientId: process.env.APPLE_ID!,
                clientSecret: process.env.APPLE_SECRET!,
            }),
        ],

        // needed jwt session because server not allowed for username+password auth
        session: { strategy: "jwt" },

        callbacks: {
            // Put user id in JWT on signin
            async jwt({ token, user }) {
                if (user) {
                    token.id = (user as any).id
                }
                return token
            },

            // Copy id from JWT into session object
            async session({ session, token }) {
                if (session.user && token?.id) {
                    (session.user as any).id = token.id;
                }
                return session
            },
        },
    }

    export default NextAuth(authOptions)