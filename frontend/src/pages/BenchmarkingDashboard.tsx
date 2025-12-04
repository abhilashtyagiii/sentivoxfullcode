import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, Award } from "lucide-react";
import { formatPercent, formatScore } from "@/lib/utils";

export default function BenchmarkingDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/benchmarking'],
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

  const benchmarks = data?.benchmarks || [];

  // Calculate overall statistics
  const topPerformer = benchmarks.reduce((prev: any, current: any) =>
    (current.avgQuestionRelevance > prev.avgQuestionRelevance) ? current : prev
  , benchmarks[0] || {});

  const avgScores = {
    questionRelevance: benchmarks.reduce((sum: number, b: any) => sum + b.avgQuestionRelevance, 0) / (benchmarks.length || 1),
    flowContinuity: benchmarks.reduce((sum: number, b: any) => sum + b.avgFlowContinuity, 0) / (benchmarks.length || 1),
    followUpQuality: benchmarks.reduce((sum: number, b: any) => sum + b.avgFollowUpQuality, 0) / (benchmarks.length || 1),
  };

  return (
    <div className="p-8 space-y-6" data-testid="benchmarking-dashboard">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Recruiter Benchmarking Dashboard</h1>
        <p className="text-muted-foreground mt-2" data-testid="text-dashboard-description">
          Compare recruiter performance and identify top performers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-total-recruiters">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recruiters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-recruiters">{benchmarks.length}</div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-question-relevance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Question Relevance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-question-relevance">
              {formatPercent(avgScores.questionRelevance)}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-flow-continuity">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Flow Continuity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-flow-continuity">
              {formatPercent(avgScores.flowContinuity)}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-top-performer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" data-testid="text-top-performer">
              {topPerformer?.recruiterName || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recruiter Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recruiter Performance Metrics</CardTitle>
          <CardDescription>Detailed performance breakdown by recruiter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarks.map((benchmark: any) => (
              <div
                key={benchmark.recruiterName}
                className="border rounded-lg p-4 space-y-3"
                data-testid={`card-recruiter-${benchmark.recruiterName}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`text-recruiter-name-${benchmark.recruiterName}`}>
                      {benchmark.recruiterName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benchmark.totalInterviews} interviews conducted
                    </p>
                  </div>
                  <Badge
                    variant={
                      benchmark.performanceRating === "excellent" ? "default" :
                      benchmark.performanceRating === "good" ? "secondary" :
                      "destructive"
                    }
                    data-testid={`badge-rating-${benchmark.recruiterName}`}
                  >
                    {benchmark.performanceRating}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Question Relevance</span>
                      <span className="font-medium">{formatPercent(benchmark.avgQuestionRelevance)}</span>
                    </div>
                    <Progress value={benchmark.avgQuestionRelevance} data-testid={`progress-relevance-${benchmark.recruiterName}`} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Flow Continuity</span>
                      <span className="font-medium">{formatPercent(benchmark.avgFlowContinuity)}</span>
                    </div>
                    <Progress value={benchmark.avgFlowContinuity} data-testid={`progress-flow-${benchmark.recruiterName}`} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Follow-up Quality</span>
                      <span className="font-medium">{formatPercent(benchmark.avgFollowUpQuality)}</span>
                    </div>
                    <Progress value={benchmark.avgFollowUpQuality} data-testid={`progress-followup-${benchmark.recruiterName}`} />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Missed Follow-ups</span>
                      <span className="font-medium">{formatScore(benchmark.avgMissedFollowUps)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Average per interview</div>
                  </div>
                </div>

                {benchmark.avgQuestionRelevance < avgScores.questionRelevance && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm">
                    <TrendingDown className="h-4 w-4" />
                    <span>Below average performance - training recommended</span>
                  </div>
                )}
              </div>
            ))}

            {benchmarks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-data">
                No recruiter data available yet. Complete some interviews to see benchmarks.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
