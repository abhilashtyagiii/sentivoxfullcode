import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, UserCheck, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/analytics/overview']
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Recruiters",
      value: data?.totalRecruiters || 0,
      icon: Users,
      link: "/admin/recruiters",
      color: "bg-blue-500"
    },
    {
      title: "Total Candidates",
      value: data?.totalCandidates || 0,
      icon: UserCheck,
      link: "/admin/candidates",
      color: "bg-green-500"
    },
    {
      title: "Total Interviews",
      value: data?.totalInterviews || 0,
      icon: FileText,
      link: "/admin/reports",
      color: "bg-purple-500"
    },
    {
      title: "Avg Sentiment",
      value: data?.avgSentiment ? `${(data.avgSentiment * 100).toFixed(1)}%` : "N/A",
      icon: TrendingUp,
      link: "/admin/analytics",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white" data-testid="text-admin-title">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.link}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/recruiters">
                <button className="w-full text-left p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" data-testid="button-view-recruiters">
                  View All Recruiters
                </button>
              </Link>
              <Link href="/admin/candidates">
                <button className="w-full text-left p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" data-testid="button-view-candidates">
                  View All Candidates
                </button>
              </Link>
              <Link href="/admin/reports">
                <button className="w-full text-left p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" data-testid="button-generate-reports">
                  Generate Reports
                </button>
              </Link>
            </CardContent>
          </Card>

          <Card data-testid="card-recent-interviews">
            <CardHeader>
              <CardTitle>Recent Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recentInterviews && data.recentInterviews.length > 0 ? (
                <div className="space-y-2">
                  {data.recentInterviews.slice(0, 5).map((interview: any, index: number) => (
                    <div
                      key={interview._id}
                      className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800"
                      data-testid={`interview-recent-${index}`}
                    >
                      <div className="font-medium text-sm">{interview.candidateName || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No recent interviews</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
