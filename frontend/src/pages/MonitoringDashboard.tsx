import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default function MonitoringDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/pipeline-monitoring'],
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

  const monitoring = data?.monitoring || [];

  // Calculate stats
  const successfulRuns = monitoring.filter((m: any) => m.status === "success").length;
  const failedRuns = monitoring.filter((m: any) => m.status === "error").length;
  const totalApiCalls = monitoring.reduce((sum: number, m: any) => sum + (m.apiCalls || 0), 0);
  const avgDuration = monitoring.length > 0
    ? monitoring.reduce((sum: number, m: any) => sum + (m.duration || 0), 0) / monitoring.length / 1000
    : 0;

  return (
    <div className="p-8 space-y-6" data-testid="monitoring-dashboard">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Pipeline Monitoring Dashboard</h1>
        <p className="text-muted-foreground mt-2" data-testid="text-dashboard-description">
          Track processing status, API usage, and error rates
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-successful-runs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Runs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-successful-runs">
              {successfulRuns}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-failed-runs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Runs</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-failed-runs">
              {failedRuns}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-api-calls">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-api-calls">
              {totalApiCalls}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-duration">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-duration">
              {avgDuration.toFixed(1)}s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pipeline Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Runs</CardTitle>
          <CardDescription>Latest processing activities and their performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monitoring.slice(0, 10).map((run: any, idx: number) => (
              <div
                key={run.id || idx}
                className="border rounded-lg p-4"
                data-testid={`card-run-${idx}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold" data-testid={`text-run-stage-${idx}`}>{run.stage}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(run.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={run.status === "success" ? "default" : "destructive"}
                    data-testid={`badge-status-${idx}`}
                  >
                    {run.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration</span>
                    <p className="font-medium">{((run.duration || 0) / 1000).toFixed(2)}s</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">API Calls</span>
                    <p className="font-medium">{run.apiCalls || 0}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tokens Used</span>
                    <p className="font-medium">{run.tokensUsed || 0}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors</span>
                    <p className="font-medium">{run.errorCount || 0}</p>
                  </div>
                </div>

                {run.errorDetails && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-700 font-medium">Error Details:</p>
                    <p className="text-sm text-red-600 mt-1">
                      {JSON.stringify(run.errorDetails)}
                    </p>
                  </div>
                )}

                {run.metadata && (
                  <details className="mt-3">
                    <summary className="text-sm text-muted-foreground cursor-pointer">
                      View detailed metrics
                    </summary>
                    <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                      {JSON.stringify(run.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            {monitoring.length === 0 && (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-data">
                No pipeline monitoring data available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
