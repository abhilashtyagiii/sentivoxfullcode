import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AudioUpload from "@/components/AudioUpload";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import ResumeUpload from "@/components/ResumeUpload";
import ProcessingStatus from "@/components/ProcessingStatus";
import AnalysisDashboard from "@/components/AnalysisDashboard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { apiFetch } from "@/lib/api";
import type { Interview, AnalysisReport } from "@/lib/types";
import { ChevronDown, Mic, Brain, BarChart3, MessageSquare, Zap, Play, FileText, Users, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { logout } = useAuth();
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadProgress, setResumeUploadProgress] = useState(0);
  const [resumeUploadError, setResumeUploadError] = useState<string>("");
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(sectionId));
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('[data-section]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Component to create particle effects
  const ParticleEffect = () => {
    return (
      <>
        {Array.from({ length: 20 }, (_, i) => (
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
      </>
    );
  };

  // Query for processing status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/interviews', currentInterviewId, 'status'],
    enabled: !!currentInterviewId,
    refetchInterval: currentInterviewId ? 2000 : false, // Simple polling - will fix stopping later
  });

  // Type assertions for status data
  const statusInfo = statusData as { status?: string; steps?: any[] } | undefined;
  
  // Query for analysis report  
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/interviews', currentInterviewId, 'report'],
    enabled: !!currentInterviewId && statusInfo?.status === 'complete',
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    console.log('[Audio Upload] Current JD length:', jobDescription.length);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('jobDescription', jobDescription || ""); // Allow empty JD for flexible upload order
      formData.append('recruiterName', recruiterName || "");
      formData.append('candidateName', candidateName || "");

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiRequest('POST', '/api/interviews', formData);
      const result = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);
      const interviewId = result.interview.id || result.interview._id;
      console.log('[Audio Upload] Interview ID:', interviewId);
      setCurrentInterviewId(interviewId);

      toast({
        title: "Upload Successful",
        description: "Your interview audio has been uploaded. Click 'Start Analysis' to begin processing.",
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });

    } catch (error: any) {
      console.error("Upload failed:", error);
      setUploadError(error?.message || "Upload failed");
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload audio file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    if (!currentInterviewId) {
      toast({
        title: "Upload Audio First",
        description: "Please upload the interview audio before uploading a resume.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingResume(true);
    setResumeUploadProgress(0);
    setResumeUploadError("");

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const progressInterval = setInterval(() => {
        setResumeUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiRequest('POST', `/api/interviews/${currentInterviewId}/resume`, formData);
      const result = await response.json();

      clearInterval(progressInterval);
      setResumeUploadProgress(100);
      setIsResumeUploaded(true);
      setResumeFileName(file.name);

      toast({
        title: "Resume Uploaded",
        description: "Resume has been uploaded and parsed successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });

    } catch (error: any) {
      console.error("Resume upload failed:", error);
      setResumeUploadError(error?.message || "Resume upload failed");
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingResume(false);
    }
  };

  const downloadFile = async (blob: Blob, filename: string) => {
    // Try modern approach first
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      // IE/Edge fallback
      (window.navigator as any).msSaveOrOpenBlob(blob, filename);
      return;
    }

    // Standard approach with fallbacks
    const url = window.URL.createObjectURL(blob);
    
    // Try using download attribute
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    // Check if download attribute is supported
    if (typeof a.download !== 'undefined') {
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      // Fallback for older browsers
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.URL.revokeObjectURL(url);
      }, 1000);
    }
  };

  const handleDownloadReport = async () => {
    if (!currentInterviewId || isDownloadingReport) return;

    setIsDownloadingReport(true);
    try {
      const response = await apiFetch(`/api/interviews/${currentInterviewId}/pdf`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to generate PDF report: ${response.status} ${errorText}`);
      }

      // Extract filename from Content-Disposition header or create a clean one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `interview-analysis-${currentInterviewId}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      
      // Check if blob has content
      if (blob.size === 0) {
        throw new Error('PDF file is empty');
      }

      await downloadFile(blob, filename);

      toast({
        title: "PDF Report Downloaded",
        description: "Your formatted interview analysis report has been downloaded successfully.",
      });

    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleNewAnalysis = () => {
    setCurrentInterviewId(null);
    setJobDescription("");
    setRecruiterName("");
    setCandidateName("");
    setUploadProgress(0);
    setUploadError("");
    queryClient.invalidateQueries();
  };

  const isProcessing = statusInfo?.status === 'processing';
  const isComplete = statusInfo?.status === 'complete';
  const isUploaded = statusInfo?.status === 'uploaded';
  const processingSteps = statusInfo?.steps || [];
  
  const handleStartAnalysis = async () => {
    if (!currentInterviewId) return;
    
    try {
      const response = await apiFetch(`/api/interviews/${currentInterviewId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ jobDescription: jobDescription.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }
      
      toast({
        title: "Analysis Started",
        description: "Your interview is now being analyzed. This may take a few minutes.",
      });
      
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });
    } catch (error: any) {
      console.error("Failed to start analysis:", error);
      toast({
        title: "Analysis Failed",
        description: error?.message || "Failed to start analysis. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-black dark text-white relative overflow-hidden">
      {/* Particle Background */}
      <div className="ai-particles fixed inset-0 z-0">
        <ParticleEffect />
      </div>

      {/* Top Navigation */}
      <div className="fixed top-0 right-0 z-50 p-4 flex gap-2">
        <Link href="/recruiter-dashboard">
          <Button 
            variant="outline" 
            className="bg-gray-900/80 backdrop-blur-sm border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300"
            data-testid="button-view-dashboard"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Dashboard
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={logout}
          className="bg-gray-900/80 backdrop-blur-sm border-red-500/30 hover:border-red-400 text-red-400 hover:text-red-300"
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Hero Section */}
      <section id="hero" data-section className="immersive-section relative z-10 pb-32">
        <div 
          className="parallax-layer text-center"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`
          }}
        >
          {/* Audio Wave Animation */}
          <div className="flex justify-center items-end space-x-2 mb-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="audio-wave bg-gradient-to-t from-cyan-400 to-purple-500 rounded-full"
                style={{
                  width: '8px',
                  height: `${20 + i * 10}px`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>

          {/* Main Brand */}
          <h1 className="text-8xl md:text-9xl font-bold mb-6 sentivox-text-gradient floating">
            SENTIVOX
          </h1>
          <p className="text-2xl md:text-3xl text-cyan-300 mb-8 font-light">
            AI-Powered Voice Analysis
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
            Revolutionary artificial intelligence that transforms audio conversations 
            into deep insights through advanced sentiment analysis and behavioral understanding.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-16 mb-20">
            <Button 
              size="lg" 
              className="glowing-button text-white text-lg px-8 py-4 rounded-full hover:scale-105 transition-all duration-300"
              onClick={() => {
                const transcriptionSection = document.getElementById('transcription');
                transcriptionSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              data-testid="button-learn-sentivox"
            >
              <Brain className="mr-2" />
              Learn About Sentivox
            </Button>
            <Button 
              size="lg" 
              className="glowing-button-outline text-lg px-8 py-4 rounded-full hover:scale-105 transition-all duration-300"
              onClick={() => {
                const tryoutSection = document.getElementById('tryout');
                tryoutSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              data-testid="button-try-sentivox"
            >
              <Play className="mr-2" />
              Try It Out
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-cyan-400" size={32} />
        </div>
      </section>

      {/* Transcription Section */}
      <section id="transcription" data-section className="immersive-section relative z-10">
        <div 
          className={`parallax-layer max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
            visibleSections.has('transcription') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <Mic className="text-cyan-400 mb-6" size={64} />
            <h2 className="text-5xl font-bold mb-6 sentivox-text-gradient">
              Precision Transcription
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Advanced AI converts your audio conversations into crystal-clear text 
              with speaker identification and timestamp precision.
            </p>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                Multi-speaker recognition
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                Real-time timestamp mapping
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                99%+ accuracy rate
              </li>
            </ul>
          </div>
          <Card className="bg-gray-900 border-cyan-500/30 p-8 floating">
            <CardContent className="space-y-4">
              <div className="text-sm text-cyan-400 font-mono">[00:15] Recruiter:</div>
              <p className="text-gray-200">"Tell me about your experience with React..."</p>
              <div className="text-sm text-blue-400 font-mono">[00:18] Candidate:</div>
              <p className="text-gray-200">"I've been working with React for over 3 years..."</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sentiment Analysis Section */}
      <section id="sentiment" data-section className="immersive-section relative z-10">
        <div 
          className={`parallax-layer max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
            visibleSections.has('sentiment') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Card className="bg-gray-900 border-pink-500/30 p-8 order-2 md:order-1 floating">
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-pink-400">Confidence</span>
                    <span className="text-white">85%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full w-[85%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-green-400">Enthusiasm</span>
                    <span className="text-white">92%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-[92%]"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="order-1 md:order-2">
            <MessageSquare className="text-pink-400 mb-6" size={64} />
            <h2 className="text-5xl font-bold mb-6 sentivox-text-gradient">
              Emotional Intelligence
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Deep sentiment analysis reveals the emotional undertones of every conversation, 
              providing insights into confidence, engagement, and authenticity.
            </p>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                Real-time emotion detection
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                Confidence scoring
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                Engagement metrics
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section id="analysis" data-section className="immersive-section relative z-10">
        <div 
          className={`parallax-layer max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
            visibleSections.has('analysis') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <Brain className="text-blue-400 mb-6" size={64} />
            <h2 className="text-5xl font-bold mb-6 sentivox-text-gradient">
              Intelligent Matching
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              AI-driven job description relevance analysis matches candidate responses 
              with role requirements for perfect hiring decisions.
            </p>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Skills alignment scoring
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Experience relevance
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Cultural fit assessment
              </li>
            </ul>
          </div>
          <Card className="bg-gray-900 border-blue-500/30 p-8 floating">
            <CardContent>
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-400">87%</div>
                  <div className="text-sm text-gray-400">JD Match Score</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-green-400 font-bold">Technical</div>
                    <div className="text-gray-300">92%</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-yellow-400 font-bold">Experience</div>
                    <div className="text-gray-300">81%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section Divider */}
      <section className="immersive-section relative z-10 border-t border-cyan-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-1 sentivox-gradient mx-auto mb-8 rounded-full"></div>
          <h2 className="text-4xl font-bold sentivox-text-gradient mb-4">Ready to Experience Sentivox?</h2>
          <p className="text-lg text-gray-400">Upload your files and see AI-powered analysis in action</p>
        </div>
      </section>

      {/* Try It Out Section */}
      <section id="tryout" data-section className="immersive-section relative z-10">
        <div 
          className={`parallax-layer max-w-4xl mx-auto text-center transition-all duration-1000 ${
            visibleSections.has('tryout') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Zap className="text-yellow-400 mb-6 mx-auto" size={64} />
          <h2 className="text-5xl font-bold mb-6 sentivox-text-gradient">
            Try Sentivox
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            <span className="text-cyan-400 font-semibold">Step 1:</span> Upload your interview audio file<br />
            <span className="text-cyan-400 font-semibold">Step 2:</span> Add job description (paste text or upload PDF/DOC)<br />
            <span className="text-green-400 font-semibold">Step 3:</span> Click "Start Analysis" to begin AI processing
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center">
                <Mic className="mr-2" size={20} />
                Upload Audio
                {currentInterviewId && <span className="ml-2 text-green-400">✓</span>}
              </h3>
              <AudioUpload
                onFileSelect={handleFileUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={uploadError}
              />
            </div>
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center">
                <Brain className="mr-2" size={20} />
                Job Description
                {jobDescription.trim() && <span className="ml-2 text-green-400">✓</span>}
              </h3>
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                disabled={isUploading || isProcessing}
                interviewId={currentInterviewId}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/50 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4 text-purple-400 flex items-center">
                <Users className="mr-2" size={20} />
                Recruiter Name (Optional)
                {recruiterName.trim() && <span className="ml-2 text-green-400">✓</span>}
              </h3>
              <Input
                type="text"
                placeholder="Enter recruiter name..."
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                disabled={isUploading || isProcessing}
                className="bg-gray-800 border-purple-500/30 text-white placeholder-gray-500"
                data-testid="input-recruiter-name"
              />
            </div>
            <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/50 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4 text-purple-400 flex items-center">
                <User className="mr-2" size={20} />
                Candidate Name (Optional)
                {candidateName.trim() && <span className="ml-2 text-green-400">✓</span>}
              </h3>
              <Input
                type="text"
                placeholder="Enter candidate name..."
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                disabled={isUploading || isProcessing}
                className="bg-gray-800 border-purple-500/30 text-white placeholder-gray-500"
                data-testid="input-candidate-name"
              />
            </div>
          </div>

          <div className="mb-12">
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/50 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center">
                <FileText className="mr-2" size={20} />
                Upload Resume (Optional)
                {isResumeUploaded && <span className="ml-2 text-green-400">✓</span>}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Upload the candidate's resume to enable AI-powered analysis of how well questions align with their background
              </p>
              <ResumeUpload
                onFileSelect={handleResumeUpload}
                isUploading={isUploadingResume}
                uploadProgress={resumeUploadProgress}
                error={resumeUploadError}
                isUploaded={isResumeUploaded}
                resumeFileName={resumeFileName}
              />
            </div>
          </div>

          {/* Start Analysis Button - Prominent when ready */}
          {currentInterviewId && jobDescription.trim() && !isProcessing && !isComplete && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl rounded-3xl"></div>
              <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 border-2 border-cyan-400/50 rounded-2xl p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                  <p className="text-2xl font-bold text-green-400">
                    Ready to Analyze!
                  </p>
                </div>
                <p className="text-gray-300 mb-6 text-base">
                  Audio and job description are uploaded. Click below to start AI-powered analysis.
                </p>
                <Button 
                  onClick={handleStartAnalysis}
                  size="lg"
                  className="sentivox-gradient pulse-glow text-white text-lg px-10 py-5 rounded-full hover:scale-105 transition-all duration-300 shadow-2xl font-bold"
                  data-testid="button-start-analysis"
                >
                  <Zap className="mr-2" size={22} />
                  Start Analysis
                </Button>
                <p className="text-xs text-gray-500 mt-4">
                  {isResumeUploaded ? "✓ Resume included for enhanced analysis" : "Optional: Upload resume for deeper insights"}
                </p>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {!currentInterviewId && !jobDescription.trim() && (
            <div className="text-center bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400">
                Upload your audio file and add a job description to get started
              </p>
            </div>
          )}
          {currentInterviewId && !jobDescription.trim() && (
            <div className="text-center bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
              <p className="text-yellow-400 flex items-center justify-center text-lg">
                <Brain className="mr-2" size={24} />
                Audio uploaded! Now add a job description to continue
              </p>
            </div>
          )}
          {!currentInterviewId && jobDescription.trim() && (
            <div className="text-center bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
              <p className="text-yellow-400 flex items-center justify-center text-lg">
                <Mic className="mr-2" size={24} />
                Job description added! Now upload your audio file to continue
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Processing Status Section */}
      {(isProcessing || (processingSteps.length > 0 && !isComplete)) && (
        <section id="processing" data-section className="immersive-section relative z-10">
          <div className="parallax-layer max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h2 className="text-4xl font-bold mb-4 sentivox-text-gradient">
                Sentivox is Analyzing...
              </h2>
              <p className="text-xl text-gray-300">
                Our AI is processing your interview with advanced algorithms
              </p>
            </div>
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-8">
              <ProcessingStatus
                steps={processingSteps as any}
                isVisible={true}
              />
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {isComplete && !!reportData && (
        <section id="results" data-section className="immersive-section relative z-10">
          <div className="parallax-layer max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">✨</div>
              <h2 className="text-5xl font-bold mb-6 sentivox-text-gradient">
                Analysis Complete
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Sentivox has analyzed your interview. Here are the insights:
              </p>
            </div>
            <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-8">
              <AnalysisDashboard
                interview={(reportData as any).interview}
                report={(reportData as any).report}
                onDownloadReport={handleDownloadReport}
                onNewAnalysis={handleNewAnalysis}
              />
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {statusInfo?.status === 'error' && (
        <section className="immersive-section relative z-10">
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Processing Error</h2>
            <p className="text-gray-300 mb-6">
              There was an error processing your interview. Please try uploading again.
            </p>
            <Button 
              onClick={handleNewAnalysis}
              className="sentivox-gradient text-white px-8 py-3 rounded-full hover:scale-105 transition-transform"
            >
              Try Again
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
