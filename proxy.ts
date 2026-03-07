import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET})

    const { pathname } = req.nextUrl

    if (token && (pathname === "/login" || pathname === "/signup")) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    if (!token && (pathname === "/profile/edit" || pathname === "/decks")) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/login", "/signup", "/profile/edit", "/decks"], //paths to run proxy on
}