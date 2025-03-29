import { LinearOAuthService } from "@/api/services/linear/linearOAuthService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTestIssueButton } from "@/components/linear/create-test-issue-button";
import { isLinearAuthenticated } from "@/lib/linear-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LinearTeamsPage() {
  // Check if user is authenticated with Linear
  if (!(await isLinearAuthenticated())) {
    redirect('/integrate/linear');
  }

  let teams = [];
  let error = null;

  try {
    const linearService = new LinearOAuthService();
    teams = await linearService.getTeams();
  } catch (err) {
    console.error("Error fetching Linear teams:", err);
    error = "Failed to fetch teams. Please try reconnecting your Linear account.";
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Linear Teams</h1>
        <Button asChild variant="outline">
          <Link href="/integrate/linear">
            Manage Integration
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {teams.length === 0 && !error ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-600 mb-2">No teams found</h2>
          <p className="text-gray-500 mb-6">
            You don't have any teams in your Linear account yet.
          </p>
          <Button asChild>
            <a href="https://linear.app/teams" target="_blank" rel="noopener noreferrer">
              Create a Team in Linear
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: any) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}

interface TeamCardProps {
  team: any;
}

function TeamCard({ team }: TeamCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="flex items-center">
          <span 
            className="w-4 h-4 rounded-full mr-2" 
            style={{ backgroundColor: team.color || '#6366F1' }} 
          />
          {team.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-sm text-gray-500 mb-3">
          <div className="flex justify-between mb-1">
            <span>Key:</span>
            <span className="font-medium text-gray-700">{team.key}</span>
          </div>
          <div className="flex justify-between">
            <span>Issues:</span>
            <span className="font-medium text-gray-700">{team.issueCount}</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Button asChild variant="outline" className="w-full" size="sm">
            <a href={`https://linear.app/team/${team.key}`} target="_blank" rel="noopener noreferrer">
              Open in Linear
            </a>
          </Button>
          <CreateTestIssueButton teamId={team.id} teamName={team.name} />
        </div>
      </CardContent>
    </Card>
  );
} 