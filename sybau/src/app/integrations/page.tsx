"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function IntegrationsPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const storedState = sessionStorage.getItem("jira_auth_state");

        if (code && state && state === storedState) {
            // Exchange code for token
            exchangeCodeForToken(code);
            sessionStorage.removeItem("jira_auth_state");
        }
    }, [searchParams]);

    const exchangeCodeForToken = async (code: string) => {
        try {
            const response = await fetch(
                "https://auth.atlassian.com/oauth/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        grant_type: "authorization_code",
                        client_id: process.env.NEXT_PUBLIC_JIRA_CLIENT_ID,
                        client_secret:
                            process.env.NEXT_PUBLIC_JIRA_CLIENT_SECRET,
                        code,
                        redirect_uri: "http://localhost:3000/integrations",
                    }),
                }
            );

            const data = await response.json();
            if (data.access_token) {
                // Store the token securely (you might want to use your own API endpoint for this)
                localStorage.setItem("jira_access_token", data.access_token);
                window.location.reload();
            }
        } catch (error) {
            console.error("Error exchanging code for token:", error);
        }
    };

    const handleJiraConnect = async () => {
        const state = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        const authUrl = new URL("https://auth.atlassian.com/authorize");

        authUrl.searchParams.append("audience", "api.atlassian.com");
        authUrl.searchParams.append(
            "client_id",
            process.env.NEXT_PUBLIC_JIRA_CLIENT_ID!
        );
        authUrl.searchParams.append(
            "scope",
            "read:jira-user write:jira-work read:jira-work"
        );
        authUrl.searchParams.append(
            "redirect_uri",
            "http://localhost:3000/integrations"
        );
        authUrl.searchParams.append("state", state);
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("prompt", "consent");

        sessionStorage.setItem("jira_auth_state", state);
        window.location.href = authUrl.toString();
    };

    const isConnected = Boolean(localStorage.getItem("jira_access_token"));

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Integrations</h1>
            <Card className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Jira</h2>
                        <p className="text-gray-500 mt-1">
                            {isConnected
                                ? "Connected to Jira"
                                : "Connect your Jira account to sync tasks"}
                        </p>
                    </div>
                    <Button
                        onClick={handleJiraConnect}
                        variant={isConnected ? "outline" : "default"}
                    >
                        {isConnected ? "Reconnect Jira" : "Connect Jira"}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
