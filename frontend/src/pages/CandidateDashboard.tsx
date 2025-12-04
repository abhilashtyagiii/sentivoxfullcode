import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, TrendingUp, MessageCircle, Target, Brain, FileText, Download, ArrowLeft, UserCheck, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

export default function CandidateDashboard() {
  const params = useParams();
  const interviewId = params.interviewId as string;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("candidate");

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/candidate-dashboard', interviewId],
    queryFn: async () => {
      const res = await apiFetch(`/api/candidate-dashboard/${interviewId}`);
      if (!res.ok) throw new Error('Failed to load candidate data');
      return res.json();
    },
    enabled: !!interviewId
  });

  const downloadReport = async (type: 'recruiter' | 'candidate') => {
    try {
      const endpoint = type === 'recruiter' 
        ? `/api/interviews/${interviewId}/recruiter-report`
        : `/api/interviews/${interviewId}/candidate-report`;
      
      const response = await apiFetch(endpoint);
      if (!response.ok) throw new Error('Failed to download report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${interviewId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `${type === 'candidate' ? 'Candidate' : 'Recruiter'} report downloaded successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading interview analysis...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-500 dark:bg-gray-900/50 dark:border-red-400">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Unable to load interview analysis. Please ensure the interview has been processed.</p>
              <Link href="/recruiter-dashboard">
                <Button className="mt-4" data-testid="button-back-dashboard">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { interview, report, candidateReport, recruiterReport, jdAnalysis, sentimentAnalysis } = data;

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 dark:text-green-400';
    if (score >= 5) return 'text-blue-600 dark:text-blue-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 7) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (score >= 5) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (score >= 3) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getRelevanceBadge = (score: number) => {
    if (score >= 75) return { variant: "default" as const, text: "Strong Match", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" };
    if (score >= 50) return { variant: "secondary" as const, text: "Good Match", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" };
    if (score >= 25) return { variant: "outline" as const, text: "Partial Match", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200" };
    return { variant: "destructive" as const, text: "Weak Match", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" };
  };

  const getReasoningText = (score: number, context: 'question' | 'answer') => {
    if (context === 'question') {
      if (score >= 75) return "This question directly targets key job requirements and skills essential for the role";
      if (score >= 50) return "This question relates to important aspects of the job description";
      if (score >= 25) return "This question has some connection to job requirements but could be more focused";
      return "This question does not align well with core job requirements";
    } else {
      if (score >= 75) return "Answer demonstrates strong relevant experience and directly addresses job requirements";
      if (score >= 50) return "Answer shows relevant experience with good alignment to job needs";
      if (score >= 25) return "Answer partially addresses requirements but lacks depth or specificity";
      return "Answer does not clearly demonstrate required skills or experience";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Link href="/recruiter-dashboard">
              <Button variant="ghost" size="sm" className="mb-2" data-testid="button-back-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-title">
              Interview Analysis
            </h1>
            <p className="text-muted-foreground mt-1">
              {interview.candidateName || 'Candidate'} • {interview.recruiterName || 'Recruiter'} • {new Date(interview.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => downloadReport('candidate')}
              data-testid="button-download-candidate-report"
            >
              <Download className="mr-2 h-4 w-4" />
              Candidate Report
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadReport('recruiter')}
              data-testid="button-download-recruiter-report"
            >
              <Download className="mr-2 h-4 w-4" />
              Recruiter Report
            </Button>
          </div>
        </div>

        {/* Tabs for Candidate and Recruiter Analysis */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gradient-to-r from-cyan-100 to-purple-100 dark:from-cyan-900/20 dark:to-purple-900/20" data-testid="tabs-list">
            <TabsTrigger value="candidate" data-testid="tab-candidate" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <UserCheck className="mr-2 h-4 w-4" />
              Candidate Analysis
            </TabsTrigger>
            <TabsTrigger value="recruiter" data-testid="tab-recruiter" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" />
              Recruiter Analysis
            </TabsTrigger>
          </TabsList>

          {/* Candidate Analysis Tab */}
          <TabsContent value="candidate" className="space-y-6 mt-6">
            {/* Overall Score */}
            <Card className={`border-2 ${getScoreBg(candidateReport?.overallScore || 5)}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2" />
                  Overall Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl font-bold ${getScoreColor(candidateReport?.overallScore || 5)} mb-2`} data-testid="text-candidate-overall-score">
                  {candidateReport?.overallScore?.toFixed(1) || '0.0'}/10
                </div>
                <Progress value={(candidateReport?.overallScore || 0) * 10} className="h-3 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  {candidateReport?.summary || 'Analysis summary not available'}
                </p>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Skills Demonstration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(candidateReport?.skillsDemonstration?.score || 5)}`}>
                    {candidateReport?.skillsDemonstration?.score?.toFixed(1) || '0.0'}/10
                  </div>
                  <Progress value={(candidateReport?.skillsDemonstration?.score || 0) * 10} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resume Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(candidateReport?.consistencyCheck?.score || 5)}`}>
                    {candidateReport?.consistencyCheck?.score?.toFixed(1) || '0.0'}/10
                  </div>
                  <Progress value={(candidateReport?.consistencyCheck?.score || 0) * 10} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Communication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(candidateReport?.communicationRating?.clarity || 5)}`}>
                    {candidateReport?.communicationRating?.clarity?.toFixed(1) || '0.0'}/10
                  </div>
                  <Progress value={(candidateReport?.communicationRating?.clarity || 0) * 10} className="mt-2 h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-base flex items-center text-green-700 dark:text-green-400">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidateReport?.strengths && candidateReport.strengths.length > 0 ? (
                    <ul className="space-y-2">
                      {candidateReport.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific strengths identified</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="text-base flex items-center text-amber-700 dark:text-amber-400">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidateReport?.areasForImprovement && candidateReport.areasForImprovement.length > 0 ? (
                    <ul className="space-y-2">
                      {candidateReport.areasForImprovement.map((area: string, index: number) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-amber-600 dark:text-amber-400 mr-2 mt-0.5">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No areas for improvement identified</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Skills Details */}
            {candidateReport?.skillsDemonstration && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skills Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Resume Claims</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidateReport.skillsDemonstration.claimedSkills?.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                        {(!candidateReport.skillsDemonstration.claimedSkills || candidateReport.skillsDemonstration.claimedSkills.length === 0) && (
                          <span className="text-sm text-muted-foreground">None listed</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Demonstrated in Interview</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidateReport.skillsDemonstration.demonstratedSkills?.map((skill: string, index: number) => (
                          <Badge key={index} variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">{skill}</Badge>
                        ))}
                        {(!candidateReport.skillsDemonstration.demonstratedSkills || candidateReport.skillsDemonstration.demonstratedSkills.length === 0) && (
                          <span className="text-sm text-muted-foreground">None identified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Analysis for Candidate */}
            {jdAnalysis?.answerAlignment && jdAnalysis.answerAlignment.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Answer Quality & JD Alignment
                  </CardTitle>
                  <CardDescription>Complete analysis of all candidate responses with job description relevance scores and detailed reasoning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {jdAnalysis.answerAlignment.map((item: any, index: number) => {
                      const badge = getRelevanceBadge(item.alignmentScore || 0);
                      return (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="mb-2">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Answer:</p>
                            <p className="text-sm">{item.answer?.substring(0, 150)}{item.answer?.length > 150 ? '...' : ''}</p>
                          </div>
                          <div className="flex items-start gap-3 flex-wrap">
                            <Badge className={badge.color} data-testid={`answer-relevance-${index}`}>
                              {badge.text} ({item.alignmentScore}%)
                            </Badge>
                            {item.keySkills && item.keySkills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.keySkills.map((skill: string, si: number) => (
                                  <Badge key={si} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-2 bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              <strong>Why this score:</strong> {item.reasoning || getReasoningText(item.alignmentScore || 0, 'answer')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Candidate Statements - All Answers */}
            {interview.transcript && interview.transcript.segments && interview.transcript.segments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    All Candidate Responses
                  </CardTitle>
                  <CardDescription>Complete record of all candidate answers during the interview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {interview.transcript.segments
                      .filter((segment: any) => 
                        !segment.speaker?.toLowerCase().includes('recruiter') && 
                        !segment.speaker?.toLowerCase().includes('speaker 1') &&
                        !segment.speaker?.toLowerCase().includes('interviewer')
                      )
                      .map((segment: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-500"
                          data-testid={`candidate-statement-${index}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-cyan-700 dark:text-cyan-300">
                              {segment.speaker || 'Candidate'}
                            </span>
                            {segment.timestamp && (
                              <span className="text-xs text-muted-foreground">{segment.timestamp}</span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{segment.text}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recruiter Analysis Tab */}
          <TabsContent value="recruiter" className="space-y-6 mt-6">
            {/* Overall Score */}
            <Card className={`border-2 ${getScoreBg(recruiterReport?.overallScore || 5)}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2" />
                  Interview Effectiveness Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl font-bold ${getScoreColor(recruiterReport?.overallScore || 5)} mb-2`} data-testid="text-recruiter-overall-score">
                  {recruiterReport?.overallScore?.toFixed(1) || '0.0'}/10
                </div>
                <Progress value={(recruiterReport?.overallScore || 0) * 10} className="h-3 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  {recruiterReport?.summary || 'Analysis summary not available'}
                </p>
              </CardContent>
            </Card>

            {/* Question Quality Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resume Relevance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(recruiterReport?.questionQuality?.resumeRelevance || 5)}`}>
                    {recruiterReport?.questionQuality?.resumeRelevance?.toFixed(1) || '0.0'}/10
                  </div>
                  <Progress value={(recruiterReport?.questionQuality?.resumeRelevance || 0) * 10} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Question Depth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(recruiterReport?.questionQuality?.depth || 5)}`}>
                    {recruiterReport?.questionQuality?.depth?.toFixed(1) || '0.0'}/10
                  </div>
                  <Progress value={(recruiterReport?.questionQuality?.depth || 0) * 10} className="mt-2 h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Candidate Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(recruiterReport?.questionQuality?.engagement || 5)}`}>
                    {recruiterReport?.questionQuality?.engagement?.toFixed(1) || '0.0'}/10
                  </div>
                  <Progress value={(recruiterReport?.questionQuality?.engagement || 0) * 10} className="mt-2 h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-base flex items-center text-green-700 dark:text-green-400">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Interview Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recruiterReport?.effectiveness?.strengths && recruiterReport.effectiveness.strengths.length > 0 ? (
                    <ul className="space-y-2">
                      {recruiterReport.effectiveness.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-green-600 dark:text-green-400 mr-2 mt-0.5">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific strengths identified</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="text-base flex items-center text-amber-700 dark:text-amber-400">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recruiterReport?.effectiveness?.improvements && recruiterReport.effectiveness.improvements.length > 0 ? (
                    <ul className="space-y-2">
                      {recruiterReport.effectiveness.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="text-amber-600 dark:text-amber-400 mr-2 mt-0.5">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recommendations available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Interview Coverage */}
            {recruiterReport?.interviewCoverage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interview Coverage Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recruiterReport.interviewCoverage.experienceCovered && recruiterReport.interviewCoverage.experienceCovered.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Experience Areas Covered
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recruiterReport.interviewCoverage.experienceCovered.map((exp: string, index: number) => (
                            <Badge key={index} variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">{exp}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {recruiterReport.interviewCoverage.skillsCovered && recruiterReport.interviewCoverage.skillsCovered.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                          Skills Assessed
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recruiterReport.interviewCoverage.skillsCovered.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {recruiterReport.interviewCoverage.missedOpportunities && recruiterReport.interviewCoverage.missedOpportunities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-muted-foreground flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
                          Missed Opportunities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recruiterReport.interviewCoverage.missedOpportunities.map((opp: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">{opp}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Question Analysis for Recruiter */}
            {jdAnalysis?.questionRelevance && jdAnalysis.questionRelevance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    Question Quality & JD Relevance Analysis
                  </CardTitle>
                  <CardDescription>Complete evaluation of all interviewer questions with job description alignment and detailed reasoning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {jdAnalysis.questionRelevance.map((item: any, index: number) => {
                      const badge = getRelevanceBadge(item.relevanceScore || 0);
                      return (
                        <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                          <div className="mb-2">
                            <p className="text-sm font-medium">"{item.question}"</p>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={badge.color} data-testid={`question-relevance-${index}`}>
                              {badge.text} ({item.relevanceScore}%)
                            </Badge>
                            {item.category && (
                              <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            )}
                          </div>
                          <div className="mt-2 bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              <strong>Why this score:</strong> {item.reasoning || getReasoningText(item.relevanceScore || 0, 'question')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recruiter Statements - All Questions */}
            {interview.transcript && interview.transcript.segments && interview.transcript.segments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Brain className="mr-2 h-5 w-5" />
                    All Recruiter Questions
                  </CardTitle>
                  <CardDescription>Complete record of all questions asked during the interview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {interview.transcript.segments
                      .filter((segment: any) => 
                        segment.speaker?.toLowerCase().includes('recruiter') || 
                        segment.speaker?.toLowerCase().includes('speaker 1') ||
                        segment.speaker?.toLowerCase().includes('interviewer')
                      )
                      .map((segment: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500"
                          data-testid={`recruiter-statement-${index}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-purple-700 dark:text-purple-300">
                              {segment.speaker || 'Recruiter'}
                            </span>
                            {segment.timestamp && (
                              <span className="text-xs text-muted-foreground">{segment.timestamp}</span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">{segment.text}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Interview Metadata */}
        <Card className="bg-white/50 dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-base">Interview Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Date:</span>
                <p className="font-semibold">{new Date(interview.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Candidate:</span>
                <p className="font-semibold">{interview.candidateName || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Recruiter:</span>
                <p className="font-semibold">{interview.recruiterName || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Status:</span>
                <p>
                  {interview.candidateOutcome === 'next_stage' && <Badge className="bg-green-500">Next Stage</Badge>}
                  {interview.candidateOutcome === 'rejected' && <Badge className="bg-red-500">Rejected</Badge>}
                  {interview.candidateOutcome === 'pending' && <Badge variant="outline">Pending</Badge>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
