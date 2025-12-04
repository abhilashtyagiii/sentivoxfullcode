import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import MetricsCards from "./MetricsCards";
import SentimentChart from "./SentimentChart";
import RelevanceChart from "./RelevanceChart";
import ConversationAnalysis from "./ConversationAnalysis";
import TrainingRecommendations from "./TrainingRecommendations";
import type { AnalysisReport, Interview } from "@/lib/types";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalysisDashboardProps {
  interview: Interview;
  report: AnalysisReport;
  onDownloadReport: () => void;
  onNewAnalysis: () => void;
}

export default function AnalysisDashboard({ interview, report, onDownloadReport, onNewAnalysis }: AnalysisDashboardProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("candidate");
  const conversationRef = useRef<HTMLDivElement>(null);

  const overallScore = Math.round((
    (report.recruiterSentiment || 0) * 0.25 +
    (report.candidateEngagement || 0) * 0.25 +
    (report.jdMatchScore || interview.embeddingAnalysis?.overallSimilarity || 0) * 0.3 +
    (report.flowContinuityScore || 0) * 0.2
  ));

  const metrics = {
    recruiterSentiment: Math.round(report.recruiterSentiment || 0),
    candidateEngagement: Math.round(report.candidateEngagement || 0),
    jdMatchScore: Math.round(report.jdMatchScore || interview.embeddingAnalysis?.overallSimilarity || 0),
    flowContinuityScore: Math.round(report.flowContinuityScore || 0),
  };

  const sentimentData = interview.sentimentAnalysis?.sentimentTimeline && interview.sentimentAnalysis.sentimentTimeline.length > 0
    ? interview.sentimentAnalysis.sentimentTimeline.slice(0, 10).map((item, index) => ({
        time: item.timestamp || `Q${index + 1}`,
        recruiter: item.recruiterScore,
        candidate: item.candidateScore,
      }))
    : [];

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const interviewId = (interview as any)._id || interview.id;
      const response = await apiFetch(`/api/interviews/${interviewId}/pdf`);
      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded",
        description: "PDF report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download PDF report",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-950 to-gray-900/80 backdrop-blur-xl border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <div className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </div>
            </Link>
            <div className="flex gap-3">
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
                data-testid="download-report-button"
              >
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download Report
              </Button>
              <Button
                onClick={onNewAnalysis}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                data-testid="new-analysis-button"
              >
                <Plus className="h-4 w-4" />
                New Analysis
              </Button>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Interview Analysis
            </h1>
            <p className="text-gray-400">
              Recruiter • Candidate • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-8 mb-8 hover:border-cyan-500/40 transition-colors" data-testid="overall-score-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-300 mb-4">Overall Performance Score</h2>
              <div className="flex items-baseline gap-2">
                <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {overallScore}
                </div>
                <div className="text-3xl text-gray-500">/100</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-cyan-400">{overallScore}%</div>
              <div className="text-sm text-gray-400 mt-2">
                {overallScore >= 80 ? '🌟 Excellent' : 
                 overallScore >= 60 ? '👍 Good' : 
                 overallScore >= 40 ? '📈 Fair' : '⚠️ Needs Work'}
              </div>
            </div>
          </div>
          <div className="mt-6 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${overallScore}%` }}
            ></div>
          </div>
        </div>

        <MetricsCards metrics={metrics} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="bg-gray-900/60 border-b border-cyan-500/20 rounded-xl p-1 gap-2 w-full justify-start">
            <TabsTrigger 
              value="candidate"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400"
              data-testid="candidate-tab"
            >
              Candidate Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="recruiter"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400"
              data-testid="recruiter-tab"
            >
              Recruiter Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="training"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400"
              data-testid="training-tab"
            >
              Training Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidate" className="mt-8 space-y-8">
            <SentimentChart data={sentimentData} />
            <RelevanceChart data={[]} />
            <div ref={conversationRef}>
              <ConversationAnalysis qaAnalysis={[]} insights={[]} />
            </div>
          </TabsContent>

          <TabsContent value="recruiter" className="mt-8 space-y-8">
            <SentimentChart data={sentimentData} />
            <RelevanceChart data={[]} />
          </TabsContent>

          <TabsContent value="training" className="mt-8">
            <TrainingRecommendations
              recommendations={[]}
              performanceGaps={[]}
              strengthAreas={[]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
