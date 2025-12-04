import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { apiFetch } from "@/lib/api";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, TrendingDown, Target, CheckCircle, XCircle, Clock, BarChart3, Download, Home, LogOut, Settings } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

interface RecruiterDashboardData {
  totalInterviews: number;
  completedInterviews: number;
  nextStageCount: number;
  rejectedCount: number;
  pendingCount: number;
  progressionRate: number;
  rejectionRate: number;
  avgJdRelevance: number;
  avgCandidateCommunication: number;
  avgFlowContinuity: number;
  effectivenessScore: number;
  recommendations: string[];
  interviews: any[];
}

export default function RecruiterDashboard() {
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("all");
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const { data: dashboardData, isLoading } = useQuery<RecruiterDashboardData>({
    queryKey: ['/api/recruiter-dashboard', selectedRecruiter],
    queryFn: async () => {
      const url = selectedRecruiter === "all"
        ? '/api/recruiter-dashboard'
        : `/api/recruiter-dashboard?recruiterName=${encodeURIComponent(selectedRecruiter)}`;
      const res = await apiFetch(url);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
    enabled: true
  });

  const { data: allInterviews } = useQuery<{ interviews: any[] }>({
    queryKey: ['/api/interviews']
  });

  const updateOutcomeMutation = useMutation({
    mutationFn: async ({ interviewId, outcome }: { interviewId: string; outcome: string }) => {
      return await apiRequest('PATCH', `/api/interviews/${interviewId}/outcome`, { outcome });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recruiter-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });
      toast({
        title: "Success",
        description: "Candidate outcome updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update outcome",
        variant: "destructive"
      });
    }
  });

  const recruiters = Array.from(new Set(
    allInterviews?.interviews?.map(i => i.recruiterName).filter(Boolean) || []
  ));

  const handleOutcomeUpdate = (interviewId: string, outcome: string) => {
    updateOutcomeMutation.mutate({ interviewId, outcome });
  };

  const downloadMainReport = async (interviewId: string) => {
    try {
      const response = await apiFetch(`/api/interviews/${interviewId}/pdf`);
      if (!response.ok) throw new Error('Failed to download PDF report');
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `interview-analysis-${interviewId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "PDF report downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF report",
        variant: "destructive"
      });
    }
  };

  const downloadReport = async (interviewId: string, type: 'recruiter' | 'candidate') => {
    try {
      const endpoint = type === 'recruiter' 
        ? `/api/interviews/${interviewId}/recruiter-report`
        : `/api/interviews/${interviewId}/candidate-report`;
      
      const response = await apiFetch(endpoint);
      if (!response.ok) throw new Error('Failed to download report');
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${type}-report-${interviewId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `${type === 'recruiter' ? 'Recruiter' : 'Candidate'} report downloaded successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-black dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const data = dashboardData;

  const outcomeChartData = [
    { name: 'Next Stage', value: data.nextStageCount, color: '#10b981' },
    { name: 'Rejected', value: data.rejectedCount, color: '#ef4444' },
    { name: 'Pending', value: data.pendingCount, color: '#f59e0b' }
  ];

  const performanceData = [
    { metric: 'JD Relevance', score: data.avgJdRelevance },
    { metric: 'Candidate Engagement', score: data.avgCandidateCommunication },
    { metric: 'Progression Rate', score: data.progressionRate }
  ];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'next_stage':
        return <Badge className="bg-green-500 text-white" data-testid={`badge-next-stage`}><CheckCircle className="w-3 h-3 mr-1" />Next Stage</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white" data-testid={`badge-rejected`}><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-cyan-500/50 text-cyan-300" data-testid={`badge-pending`}><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getEffectivenessRating = (score: number) => {
    if (score >= 80) return { rating: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/50' };
    if (score >= 60) return { rating: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/50' };
    if (score >= 40) return { rating: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/50' };
    return { rating: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/50' };
  };

  const effectiveness = getEffectivenessRating(data.effectivenessScore);

  return (
    <div className="min-h-screen bg-black dark text-white relative overflow-hidden p-8">
      {/* AI Particle Background */}
      <div className="ai-particles fixed inset-0 z-0">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="ai-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold sentivox-text-gradient mb-2" data-testid="text-title">
              Recruiter Analytics Portal
            </h1>
            <p className="text-gray-400 text-lg">
              AI-Powered Performance Insights • Welcome, {user?.name || 'Recruiter'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" className="bg-gray-900/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20" data-testid="button-back-home">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="bg-gray-900/50 border-purple-500/30 text-purple-300 hover:bg-purple-500/20" data-testid="button-settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Button
              variant="outline"
              className="bg-gray-900/50 border-red-500/30 text-red-300 hover:bg-red-500/20"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Recruiter Filter */}
        {recruiters.length > 0 && (
          <Card className="bg-gray-900/80 backdrop-blur-md border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">Filter by Recruiter</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRecruiter} onValueChange={setSelectedRecruiter}>
                <SelectTrigger className="w-full md:w-64 bg-gray-800 border-cyan-500/30 text-white" data-testid="select-recruiter-filter">
                  <SelectValue placeholder="Select recruiter" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-cyan-500/30 text-white">
                  <SelectItem value="all">All Recruiters</SelectItem>
                  {recruiters.map(recruiter => (
                    <SelectItem key={recruiter} value={recruiter}>{recruiter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/80 backdrop-blur-md border-l-4 border-l-cyan-500 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Interviews</CardTitle>
              <Users className="h-5 w-5 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-300" data-testid="text-total-interviews">{data.totalInterviews}</div>
              <p className="text-xs text-gray-500 mt-1">{data.completedInterviews} completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 backdrop-blur-md border-l-4 border-l-green-500 border-green-500/30 hover:border-green-400/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Progression Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400" data-testid="text-progression-rate">
                {data.progressionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">{data.nextStageCount} candidates advanced</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 backdrop-blur-md border-l-4 border-l-red-500 border-red-500/30 hover:border-red-400/50 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Rejection Rate</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400" data-testid="text-rejection-rate">
                {data.rejectionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">{data.rejectedCount} candidates rejected</p>
            </CardContent>
          </Card>

          <Card className={`bg-gray-900/80 backdrop-blur-md border-l-4 ${effectiveness.bg} border-${effectiveness.color.replace('text-', '')} hover:opacity-90 transition-all`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Effectiveness Score</CardTitle>
              <Target className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${effectiveness.color}`} data-testid="text-effectiveness-score">
                {data.effectivenessScore.toFixed(1)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{effectiveness.rating}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Candidate Outcomes Pie Chart */}
          <Card className="bg-gray-900/80 backdrop-blur-md border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">Candidate Outcomes Distribution</CardTitle>
              <CardDescription className="text-gray-400">Overall candidate progression status</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={outcomeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {outcomeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #06b6d4' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics Bar Chart */}
          <Card className="bg-gray-900/80 backdrop-blur-md border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-300">Average Performance Metrics</CardTitle>
              <CardDescription className="text-gray-400">Key performance indicators across interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="metric" stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #06b6d4' }} />
                  <Bar dataKey="score" fill="url(#colorGradient)" />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        <Card className="bg-gray-900/80 backdrop-blur-md border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center text-cyan-300">
              <BarChart3 className="mr-2 text-purple-400" />
              Interview Records & Outcome Tracking
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage candidate outcomes and download detailed reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.interviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="mx-auto h-16 w-16 mb-4 text-gray-600" />
                <p className="text-lg">No interviews found</p>
                <p className="text-sm mt-2">Upload an interview recording to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="border border-cyan-500/20 rounded-lg p-5 hover:bg-gray-800/50 hover:border-cyan-400/40 transition-all"
                    data-testid={`card-interview-${interview.id}`}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-3">
                          <h3 className="font-semibold text-lg text-white" data-testid={`text-interview-filename-${interview.id}`}>
                            {interview.fileName}
                          </h3>
                          {getOutcomeBadge(interview.candidateOutcome || 'pending')}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-400">
                          {interview.candidateName && (
                            <div>
                              <span className="font-medium text-cyan-400">Candidate:</span> {interview.candidateName}
                            </div>
                          )}
                          {interview.recruiterName && (
                            <div>
                              <span className="font-medium text-purple-400">Recruiter:</span> {interview.recruiterName}
                            </div>
                          )}
                          {interview.report && (
                            <>
                              <div>
                                <span className="font-medium text-green-400">JD Match:</span> {interview.report.jdMatchScore?.toFixed(1) || 'N/A'}%
                              </div>
                              <div>
                                <span className="font-medium text-blue-400">Engagement:</span> {interview.report.candidateEngagement?.toFixed(1) || 'N/A'}%
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
                        <Select
                          value={interview.candidateOutcome || 'pending'}
                          onValueChange={(value) => handleOutcomeUpdate(interview.id, value)}
                          disabled={updateOutcomeMutation.isPending}
                        >
                          <SelectTrigger className="w-full sm:w-40 bg-gray-800 border-cyan-500/30 text-white" data-testid={`select-outcome-${interview.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-cyan-500/30 text-white">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="next_stage">Next Stage</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>

                        {interview.processingStatus === 'complete' && (
                          <div className="flex flex-wrap gap-2">
                            {/* Main PDF Download - Always available for completed interviews */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30 flex-1 sm:flex-none"
                              onClick={() => downloadMainReport(interview.id)}
                              data-testid={`button-download-pdf-${interview.id}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF Report
                            </Button>
                            
                            {/* Recruiter Report - Always available for completed interviews */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30 flex-1 sm:flex-none"
                              onClick={() => downloadReport(interview.id, 'recruiter')}
                              data-testid={`button-download-recruiter-${interview.id}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Recruiter
                            </Button>
                            
                            {/* Candidate Report - Always available for completed interviews */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-cyan-500/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 flex-1 sm:flex-none"
                              onClick={() => downloadReport(interview.id, 'candidate')}
                              data-testid={`button-download-candidate-${interview.id}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Candidate
                            </Button>
                          </div>
                        )}

                        <Link href={`/candidate-dashboard/${interview.id}`}>
                          <Button size="sm" className="glowing-button-outline w-full sm:w-auto whitespace-nowrap" data-testid={`button-view-details-${interview.id}`}>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <Card className={`bg-gray-900/80 backdrop-blur-md border-l-4 ${data.effectivenessScore >= 75 ? 'border-l-green-500 border-green-500/30' : data.effectivenessScore >= 60 ? 'border-l-blue-500 border-blue-500/30' : 'border-l-yellow-500 border-yellow-500/30'}`}>
            <CardHeader>
              <CardTitle className={data.effectivenessScore >= 75 ? 'text-green-400' : data.effectivenessScore >= 60 ? 'text-blue-400' : 'text-yellow-400'}>
                {data.effectivenessScore >= 75 ? '🎉 Performance Insights' : data.effectivenessScore >= 60 ? '💡 Recommendations for Growth' : '⚠️ Training Recommendations'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {data.effectivenessScore >= 75 ? 'Excellent work! Keep up the great performance.' : 'AI-generated actionable insights to improve your interviewing effectiveness'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <ul className="space-y-3">
                {data.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className={`mr-3 mt-0.5 ${data.effectivenessScore >= 75 ? 'text-green-400' : data.effectivenessScore >= 60 ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {data.effectivenessScore >= 75 ? '✓' : '•'}
                    </span>
                    <span className="text-sm leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
