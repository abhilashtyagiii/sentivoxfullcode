import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, FileText, Download } from "lucide-react";

export default function AdminReports() {
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
            Reports
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card data-testid="card-recruiter-reports">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recruiter Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate comprehensive reports for recruiter performance and analytics.
              </p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors" data-testid="button-generate-recruiter-report">
                <Download className="h-4 w-4" />
                Generate Recruiter Report
              </button>
            </CardContent>
          </Card>

          <Card data-testid="card-candidate-reports">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Candidate Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Generate detailed reports for candidate interviews and assessments.
              </p>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors" data-testid="button-generate-candidate-report">
                <Download className="h-4 w-4" />
                Generate Candidate Report
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
