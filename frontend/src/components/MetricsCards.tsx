import { Card, CardContent } from "@/components/ui/card";
import { Smile, UserCheck, Target, Route, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPercent, formatScore } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface MetricsCardsProps {
  metrics: {
    recruiterSentiment: number;
    candidateEngagement: number;
    jdMatchScore: number;
    flowContinuityScore: number;
  };
}

const metricExplanations = {
  recruiterSentiment: {
    title: "Recruiter Sentiment",
    description: "Measures the emotional tone and positivity of the recruiter throughout the interview.",
    goodScore: "A score of 7+ indicates a positive, welcoming interview atmosphere."
  },
  candidateEngagement: {
    title: "Candidate Engagement",
    description: "Evaluates how actively and enthusiastically the candidate participated in the conversation.",
    goodScore: "Above 70% indicates strong engagement with detailed, thoughtful responses."
  },
  jdMatchScore: {
    title: "JD Match Score",
    description: "Analyzes how well the candidate's responses align with the job description requirements.",
    goodScore: "75%+ indicates excellent alignment with required skills and experience."
  },
  flowContinuity: {
    title: "Flow Continuity",
    description: "Assesses the logical flow and natural progression of the conversation.",
    goodScore: "Above 75% indicates smooth transitions and well-connected dialogue."
  }
};

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const getSentimentDescription = (score: number) => {
    if (score >= 8) return "Excellent sentiment";
    if (score >= 7) return "Positive sentiment";
    if (score >= 6) return "Good sentiment";
    if (score >= 5) return "Neutral sentiment";
    if (score >= 3) return "Below average";
    return "Negative sentiment";
  };

  const getEngagementDescription = (score: number) => {
    if (score >= 85) return "High engagement";
    if (score >= 70) return "Good engagement";
    if (score >= 55) return "Moderate engagement";
    if (score >= 30) return "Low engagement";
    return "Very low engagement";
  };

  const getMatchDescription = (score: number) => {
    if (score >= 85) return "Excellent alignment";
    if (score >= 75) return "Good alignment";
    if (score >= 60) return "Fair alignment";
    if (score >= 40) return "Poor alignment";
    return "No alignment";
  };

  const getFlowDescription = (score: number) => {
    if (score >= 85) return "Excellent flow";
    if (score >= 75) return "Logical flow";
    if (score >= 60) return "Acceptable flow";
    if (score >= 40) return "Choppy flow";
    return "Poor flow";
  };

  const cards = [
    {
      title: "Resume Relevance",
      value: formatScore(metrics.recruiterSentiment),
      numericValue: metrics.recruiterSentiment * 10,
      change: getSentimentDescription(metrics.recruiterSentiment),
      icon: Smile,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30",
      borderColor: "border-cyan-200 dark:border-cyan-800/50",
      explanation: metricExplanations.recruiterSentiment
    },
    {
      title: "Question Depth", 
      value: formatPercent(metrics.candidateEngagement),
      numericValue: metrics.candidateEngagement,
      change: getEngagementDescription(metrics.candidateEngagement),
      icon: UserCheck,
      gradient: "from-blue-500 to-purple-500",
      bgGradient: "from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30",
      borderColor: "border-blue-200 dark:border-blue-800/50",
      explanation: metricExplanations.candidateEngagement
    },
    {
      title: "Candidate Engagement",
      value: formatPercent(metrics.jdMatchScore), 
      numericValue: metrics.jdMatchScore,
      change: getMatchDescription(metrics.jdMatchScore),
      icon: Target,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      borderColor: "border-purple-200 dark:border-purple-800/50",
      explanation: metricExplanations.jdMatchScore
    }
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card 
            key={card.title}
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-default",
              "bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl",
              card.borderColor
            )}
            data-testid={`metric-card-${index}`}
          >
            <div className={cn("absolute inset-0 opacity-30 bg-gradient-to-br", card.bgGradient)}></div>
            <CardContent className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {card.title}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 dark:hover:text-gray-200 transition-colors" data-testid={`info-icon-${index}`} />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-white dark:bg-gray-900 border-cyan-200 dark:border-cyan-800" side="top">
                      <div className="space-y-2">
                        <p className="font-semibold text-cyan-600 dark:text-cyan-400">{card.explanation.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{card.explanation.description}</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          {card.explanation.goodScore}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg", card.gradient)}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <div className="mb-3">
                <p className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", card.gradient)} data-testid={`metric-value-${index}`}>
                  {card.value}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", card.gradient)}
                    style={{ width: `${Math.min(card.numericValue, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400" data-testid={`metric-change-${index}`}>
                  {card.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
