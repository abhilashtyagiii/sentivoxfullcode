import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Users, FileText } from "lucide-react";

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics/overview']
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/dashboard">
            <button className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Analytics
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-total-interviews">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <FileText className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data?.totalInterviews || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-sentiment">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Sentiment</CardTitle>
              <TrendingUp className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {data?.avgSentiment ? `${(data.avgSentiment * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-relevance">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Relevance</CardTitle>
              <Users className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {data?.avgRelevance ? `${(data.avgRelevance * 100).toFixed(1)}%` : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-analytics-details">
          <CardHeader>
            <CardTitle>System Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Total Recruiters</span>
                <span className="text-2xl font-bold">{data?.totalRecruiters || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Total Candidates</span>
                <span className="text-2xl font-bold">{data?.totalCandidates || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Success Rate</span>
                <span className="text-2xl font-bold">
                  {data?.avgSentiment && data.avgRelevance
                    ? `${(((data.avgSentiment + data.avgRelevance) / 2) * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
