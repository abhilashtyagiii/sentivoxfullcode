import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function AdminCandidates() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/admin/candidates']
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading candidates...</p>
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
            Candidates
          </h1>
        </div>

        <Card data-testid="card-candidates-table">
          <CardHeader>
            <CardTitle>All Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Applied Role</TableHead>
                  <TableHead>Total Interviews</TableHead>
                  <TableHead>Average Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.candidates && data.candidates.length > 0 ? (
                  data.candidates.map((candidate: any, index: number) => (
                    <TableRow key={candidate._id} data-testid={`row-candidate-${index}`}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.appliedRole}</TableCell>
                      <TableCell>{candidate.totalInterviews}</TableCell>
                      <TableCell>
                        {candidate.performance?.averageScore
                          ? `${(candidate.performance.averageScore * 100).toFixed(1)}%`
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No candidates found
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
