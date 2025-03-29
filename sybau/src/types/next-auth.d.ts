import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user?: {
            id: string;
        } & DefaultSession["user"];
        jiraAccessToken?: string;
        jiraRefreshToken?: string;
        jiraAccountId?: string;
    }

    interface User {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        jiraApiToken?: string;
        jiraCloudId?: string;
    }

    interface Profile {
        account_id?: string;
        name?: string;
        email?: string;
        picture?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        access_token?: string;
        refresh_token?: string;
        account_id?: string;
    }
}
