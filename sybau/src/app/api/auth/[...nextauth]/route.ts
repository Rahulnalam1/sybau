import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import crypto from "crypto";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth credentials");
}

if (!process.env.JIRA_CLIENT_ID || !process.env.JIRA_CLIENT_SECRET) {
    throw new Error("Missing Jira OAuth credentials");
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub!;
                session.jiraAccessToken = token.access_token as string;
                session.jiraRefreshToken = token.refresh_token as string;
                session.jiraAccountId = token.account_id as string;
            }
            return session;
        },
        async jwt({ token, account, profile }) {
            if (account && account.provider === "jira") {
                token.access_token = account.access_token;
                token.refresh_token = account.refresh_token;
                token.account_id = profile?.account_id;
            }
            return token;
        },
    },
    debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
