import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function AdminRecruiters() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/recruiters']
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading recruiters...</p>
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
            Recruiters
          </h1>
        </div>

        <Card data-testid="card-recruiters-table">
          <CardHeader>
            <CardTitle>All Recruiters</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Interviews</TableHead>
                  <TableHead>Avg Sentiment</TableHead>
                  <TableHead>Avg Relevance</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recruiters && data.recruiters.length > 0 ? (
                  data.recruiters.map((recruiter: any, index: number) => (
                    <TableRow key={recruiter.id} data-testid={`row-recruiter-${index}`}>
                      <TableCell className="font-medium">{recruiter.name}</TableCell>
                      <TableCell>{recruiter.email}</TableCell>
                      <TableCell>{recruiter.totalInterviews}</TableCell>
                      <TableCell>{(recruiter.avgSentiment * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(recruiter.avgRelevance * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        {recruiter.lastActivity
                          ? new Date(recruiter.lastActivity).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No recruiters found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
