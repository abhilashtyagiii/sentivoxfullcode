export interface Interview {
  id: string;
  fileName: string;
  filePath: string;
  jobDescription: string;
  resumeFileName?: string;
  resumeFilePath?: string;
  resumeText?: string;
  transcription: TranscriptionResult | null;
  encryptedTranscript?: string;
  piiRedacted?: boolean;
  piiEntities?: any[];
  sentimentAnalysis: SentimentResult | null;
  multiModalSentiment?: any;
  voiceToneAnalysis?: any;
  jdAnalysis: JDAnalysis | null;
  embeddingAnalysis?: { overallSimilarity: number; [key: string]: any };
  flowAnalysis: FlowAnalysis | null;
  graphFlowModel?: any;
  explainabilityData?: any;
  resumeAnalysis?: any;
  candidateReport?: any;
  recruiterReport?: any;
  processingStatus: "pending" | "processing" | "complete" | "error";
  processingSteps: ProcessingStep[];
  apiUsageMetrics?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptionResult {
  text: string;
  segments: Array<{
    speaker: string;
    timestamp: string;
    text: string;
  }>;
}

export interface SentimentResult {
  recruiterSentiment: {
    positive: number;
    neutral: number;
    negative: number;
    overallScore: number;
    reasoning?: string;
  };
  candidateSentiment: {
    positive: number;
    neutral: number;
    negative: number;
    overallScore: number;
    reasoning?: string;
  };
  sentimentTimeline?: Array<{
    timestamp: string;
    recruiterScore: number;
    candidateScore: number;
  }>;
}

export interface JDAnalysis {
  overallScore: number;
  categoryBreakdown: {
    technicalSkills: { score: number; details: string; matchedSkills: string[]; missingSkills: string[]; };
    experienceLevel: { score: number; details: string; yearsRequired: number; yearsCandidate: number; };
    culturalFit: { score: number; details: string; };
    communication: { score: number; details: string; };
    problemSolving: { score: number; details: string; };
    leadership: { score: number; details: string; };
    industryKnowledge: { score: number; details: string; };
    educationQualifications: { score: number; details: string; };
    softSkills: { score: number; details: string; };
    motivationFit: { score: number; details: string; };
  };
  questionRelevance: Array<{
    question: string;
    relevanceScore: number;
    category: string;
    reasoning: string;
  }>;
  answerAlignment: Array<{
    answer: string;
    alignmentScore: number;
    keySkills: string[];
    categories: string[];
    reasoning: string;
  }>;
  skillGapAnalysis: {
    criticalMissingSkills: string[];
    unexpectedSkills: string[];
    overqualifiedAreas: string[];
    underqualifiedAreas: string[];
  };
  detailedReasoningCandidate: string;
  detailedReasoningRecruiter: string;
  recommendedAction: string;
}

export interface FlowAnalysis {
  continuityScore: number;
  flowBreaks: Array<{
    timestamp: string;
    issue: string;
    severity: string;
  }>;
  insights: string[];
}

export interface ProcessingStep {
  name: string;
  status: "pending" | "processing" | "complete" | "error";
  message: string;
  timestamp: Date;
  duration?: number;
  apiCalls?: number;
  tokensUsed?: number;
}

export interface AnalysisReport {
  id: string;
  interviewId: string;
  recruiterSentiment: number;
  candidateEngagement: number;
  jdMatchScore: number;
  embeddingMatchScore?: number;
  flowContinuityScore: number;
  voiceToneScore?: number;
  insights: string[];
  qaAnalysis: Array<{
    question: string;
    timestamp: string;
    answers: Array<{
      text: string;
      timestamp: string;
      sentiment: string;
      jdMatch: number;
      reasoning?: string;
    }>;
    relevance: number;
    reasoning?: string;
  }>;
  trainingRecommendations?: {
    recommendations: any[];
    performanceGaps: any[];
    strengthAreas: string[];
    overallRating: "excellent" | "good" | "needs_improvement" | "poor";
  };
  reportData: {
    summary: {
      interviewLength: string;
      questionsAsked: number;
      avgResponseLength?: number;
      missedFollowUps?: number;
    };
    recommendations: string[];
  };
  scoreExplanations?: any;
  createdAt: Date;
}
