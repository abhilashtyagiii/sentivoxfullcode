import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, FileText } from "lucide-react";
import { formatPercent } from "@/lib/utils";

export default function ComparisonDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/comparison'],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const comparisons = data?.comparisons || [];
  const completedInterviews = comparisons.filter((c: any) => c.status === "complete");

  // Calculate statistics
  const avgJDMatch = completedInterviews.length > 0
    ? completedInterviews.reduce((sum: number, c: any) => sum + c.jdMatchScore, 0) / completedInterviews.length
    : 0;

  const avgFlowContinuity = completedInterviews.length > 0
    ? completedInterviews.reduce((sum: number, c: any) => sum + c.flowContinuityScore, 0) / completedInterviews.length
    : 0;

  return (
    <div className="p-8 space-y-6" data-testid="comparison-dashboard">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Interview Comparison Dashboard</h1>
        <p className="text-muted-foreground mt-2" data-testid="text-dashboard-description">
          Side-by-side comparison and trend analysis across interviews
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-interviews">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-interviews">
              {comparisons.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedInterviews.length} completed
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-jd-match">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg JD Match</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-jd-match">
              {formatPercent(avgJDMatch)}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-flow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Flow Continuity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-flow">
              {formatPercent(avgFlowContinuity)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Comparison</CardTitle>
          <CardDescription>Compare key metrics across all interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Interview</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-right p-2">JD Match</th>
                  <th className="text-right p-2">Embedding Score</th>
                  <th className="text-right p-2">Flow</th>
                  <th className="text-right p-2">Voice Tone</th>
                  <th className="text-right p-2">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((interview: any, idx: number) => (
                  <tr
                    key={interview.id || idx}
                    className="border-b hover:bg-gray-50"
                    data-testid={`row-interview-${idx}`}
                  >
                    <td className="p-2 font-medium" data-testid={`text-filename-${idx}`}>
                      {interview.fileName}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {new Date(interview.date).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <Badge
                        variant={interview.status === "complete" ? "default" : "secondary"}
                        data-testid={`badge-status-${idx}`}
                      >
                        {interview.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-right font-medium" data-testid={`text-jd-${idx}`}>
                      {formatPercent(interview.jdMatchScore)}
                    </td>
                    <td className="p-2 text-right font-medium" data-testid={`text-embedding-${idx}`}>
                      {formatPercent(interview.embeddingMatchScore)}
                    </td>
                    <td className="p-2 text-right font-medium" data-testid={`text-flow-${idx}`}>
                      {formatPercent(interview.flowContinuityScore)}
                    </td>
                    <td className="p-2 text-right font-medium" data-testid={`text-voice-${idx}`}>
                      {formatPercent(interview.voiceToneScore)}
                    </td>
                    <td className="p-2 text-right font-medium" data-testid={`text-engagement-${idx}`}>
                      {formatPercent(interview.candidateEngagement)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {comparisons.length === 0 && (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-data">
                No interviews available for comparison yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
