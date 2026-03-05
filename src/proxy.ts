import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isProtectedPath = pathname.startsWith("/adminpanel") || pathname.startsWith("/aplikacje");

    if (isProtectedPath && !req.auth) {
        return Response.redirect(new URL("/login", req.url));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
