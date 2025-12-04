import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { User, Users, HelpCircle } from "lucide-react";

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  overallScore: number;
  reasoning?: string;
}

interface SentimentBreakdownProps {
  recruiterSentiment?: SentimentData;
  candidateSentiment?: SentimentData;
}

export default function SentimentBreakdown({ recruiterSentiment, candidateSentiment }: SentimentBreakdownProps) {
  // Clamp values to ensure they're within valid ranges
  const clampSentiment = (value: number): number => {
    if (isNaN(value) || value < 0) return 0;
    if (value > 1) return 1;
    return value;
  };

  const clampScore = (value: number): number => {
    if (isNaN(value) || value < 1) return 1;
    if (value > 10) return 10;
    return value;
  };

  const getSanitizedSentiment = (sentiment: SentimentData) => ({
    positive: clampSentiment(sentiment.positive),
    neutral: clampSentiment(sentiment.neutral),
    negative: clampSentiment(sentiment.negative),
    overallScore: clampScore(sentiment.overallScore),
    reasoning: sentiment.reasoning || "No reasoning provided"
  });

  const getSentimentLabel = (sentiment: SentimentData) => {
    const sanitized = getSanitizedSentiment(sentiment);
    const { positive, neutral, negative } = sanitized;
    if (positive > neutral && positive > negative) return "Positive";
    if (negative > neutral && negative > positive) return "Negative";
    return "Neutral";
  };

  const getSentimentBadgeVariant = (sentiment: SentimentData): "default" | "secondary" | "destructive" => {
    const sanitized = getSanitizedSentiment(sentiment);
    const { positive, neutral, negative } = sanitized;
    if (positive > neutral && positive > negative) return "default"; // Green
    if (negative > neutral && negative > positive) return "destructive"; // Red
    return "secondary"; // Blue for neutral
  };

  const SentimentBar = ({ 
    sentiment, 
    label, 
    icon 
  }: { 
    sentiment: SentimentData; 
    label: string;
    icon: React.ReactNode;
  }) => {
    const sanitized = getSanitizedSentiment(sentiment);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-foreground">{label}</span>
          </div>
          <Badge variant={getSentimentBadgeVariant(sentiment)} data-testid={`sentiment-badge-${label.toLowerCase()}`}>
            {getSentimentLabel(sentiment)}
          </Badge>
        </div>
        
        {/* Sentiment Breakdown Bars */}
        <div className="space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-3 cursor-help">
                  <span className="text-sm text-green-700 dark:text-green-400 w-16 flex items-center">
                    Positive <HelpCircle className="ml-1 h-3 w-3" />
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${sanitized.positive * 100}%` }}
                      data-testid={`positive-bar-${label.toLowerCase()}`}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8">{Math.round(sanitized.positive * 100)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm font-medium mb-1">Positive Sentiment Reasoning:</p>
                <p className="text-xs">{sanitized.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-3 cursor-help">
                  <span className="text-sm text-blue-700 dark:text-blue-400 w-16 flex items-center">
                    Neutral <HelpCircle className="ml-1 h-3 w-3" />
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${sanitized.neutral * 100}%` }}
                      data-testid={`neutral-bar-${label.toLowerCase()}`}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8">{Math.round(sanitized.neutral * 100)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm font-medium mb-1">Neutral Sentiment Reasoning:</p>
                <p className="text-xs">{sanitized.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-3 cursor-help">
                  <span className="text-sm text-red-700 dark:text-red-400 w-16 flex items-center">
                    Negative <HelpCircle className="ml-1 h-3 w-3" />
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${sanitized.negative * 100}%` }}
                      data-testid={`negative-bar-${label.toLowerCase()}`}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-8">{Math.round(sanitized.negative * 100)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm font-medium mb-1">Negative Sentiment Reasoning:</p>
                <p className="text-xs">{sanitized.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Overall Score */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Score:</span>
          <span className="font-bold text-foreground" data-testid={`overall-score-${label.toLowerCase()}`}>
            {sanitized.overallScore.toFixed(1)}/10
          </span>
        </div>
        
        {/* Reasoning (always visible but truncated) */}
        {sanitized.reasoning && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 bg-muted rounded-lg cursor-help" data-testid={`reasoning-${label.toLowerCase()}`}>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Analysis Reasoning:</p>
                  <p className="text-sm text-foreground line-clamp-2">
                    {sanitized.reasoning.length > 120 
                      ? `${sanitized.reasoning.substring(0, 120)}...` 
                      : sanitized.reasoning}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="text-sm">{sanitized.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  // Show empty state if no sentiment data
  if (!recruiterSentiment && !candidateSentiment) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Breakdown</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">No Sentiment Data Available</h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              Detailed sentiment breakdown will appear here once your interview audio is processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Sentiment Analysis Breakdown</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {recruiterSentiment && (
            <SentimentBar 
              sentiment={recruiterSentiment}
              label="Recruiter"
              icon={<User className="w-5 h-5 text-blue-600" />}
            />
          )}
          
          {candidateSentiment && (
            <SentimentBar 
              sentiment={candidateSentiment}
              label="Candidate"
              icon={<Users className="w-5 h-5 text-green-600" />}
            />
          )}
        </div>
        
        {/* Additional help text */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-2">
            <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">How to read this analysis:</p>
              <ul className="text-blue-700 dark:text-blue-400 space-y-1">
                <li>• <strong>Positive:</strong> Enthusiasm, satisfaction, genuine interest</li>
                <li>• <strong>Neutral:</strong> Professional but neither positive nor negative (hover for details)</li>
                <li>• <strong>Negative:</strong> Frustration, stress, defensiveness, or dissatisfaction</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}