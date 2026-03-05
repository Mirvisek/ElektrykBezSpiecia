import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    providers: [], // Będzie dodane w auth.ts ze względu na ograniczenia brzegowe (Edge)
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.mustChangePassword = (user as any).mustChangePassword;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).mustChangePassword = token.mustChangePassword;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    }
} satisfies NextAuthConfig;
