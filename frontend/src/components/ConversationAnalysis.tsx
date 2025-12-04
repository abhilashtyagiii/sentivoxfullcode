import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, HelpCircle, Lightbulb, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QAItem {
  question: string;
  timestamp: string;
  answers: Array<{
    text: string;
    timestamp: string;
    matchScore?: number;
    matchLevel?: string;
    matchExplanation?: string;
    sentiment?: string;
    jdMatch: number;
    reasoning?: string;
  }>;
  relevance: number;
  reasoning?: string;
}

interface ConversationAnalysisProps {
  qaAnalysis: QAItem[];
  insights: string[];
}

export default function ConversationAnalysis({ qaAnalysis, insights }: ConversationAnalysisProps) {
  const getBadgeColor = (score: number) => {
    if (score >= 85) return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
    if (score >= 70) return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700";
    if (score >= 50) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    return "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700";
  };

  const getBadgeText = (score: number) => {
    if (score >= 85) return `Excellent (${score}%)`;
    if (score >= 70) return `Good (${score}%)`;
    if (score >= 50) return `Fair (${score}%)`;
    return `Poor (${score}%)`;
  };

  const getRelevanceExplanation = (score: number, reasoning?: string) => {
    if (reasoning) return reasoning;
    
    if (score >= 85) return `Why ${score}%? This question fully aligns with the job description, targeting critical competencies and core responsibilities. It effectively evaluates the candidate's ability to perform key functions of the role.`;
    if (score >= 70) return `Why ${score}%? This question covers most job requirements but could be more specific in certain areas. It addresses important skills mentioned in the JD but may lack some depth or miss minor details.`;
    if (score >= 50) return `Why ${score}%? This question is partially relevant, touching on some job requirements but missing important aspects. Consider focusing more directly on the specific technical skills or key responsibilities outlined in the JD.`;
    return `Why ${score}%? This question has minimal connection to the job description. It doesn't effectively assess the candidate's fit for the role's core functions and required competencies. Align questions more closely with JD requirements.`;
  };

  const getAnswerExplanation = (score: number, reasoning?: string) => {
    if (reasoning) return reasoning;
    
    if (score >= 85) return `Why ${score}%? The candidate's answer comprehensively and directly addresses the recruiter's question. The response demonstrates clear understanding, provides relevant examples, and covers all key points asked.`;
    if (score >= 70) return `Why ${score}%? The answer covers the main points of the question with good clarity. The candidate understood the question and provided relevant information, though some details could be more specific.`;
    if (score >= 50) return `Why ${score}%? The answer partially addresses the question but misses some important aspects or lacks clarity. The candidate understood the general intent but didn't fully address all parts of the question.`;
    return `Why ${score}%? The answer does not properly address the recruiter's question. The candidate either misunderstood the question or provided information unrelated to what was asked.`;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-cyan-100 dark:border-cyan-900/50 overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-6">
            Question & Answer Analysis
          </h3>
          
          <div className="space-y-6">
            {qaAnalysis.map((qa, index) => (
              <div 
                key={index} 
                id={`transcript-segment-${index}`}
                className="relative border-l-4 border-gradient-to-b from-cyan-400 to-blue-500 pl-5 transition-all duration-300 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 rounded-r-xl py-4 -my-2" 
                style={{ borderColor: '#06b6d4' }}
                data-testid={`qa-item-${index}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      <HelpCircle className="inline text-cyan-500 mr-2 h-4 w-4" />
                      "{qa.question}"
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap text-sm text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 rounded-full bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs">
                        Recruiter • {qa.timestamp}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border cursor-help ${getBadgeColor(qa.relevance)}`} data-testid={`relevance-badge-${index}`}>
                            <span className="text-xs font-medium">JD Relevance: {getBadgeText(qa.relevance)}</span>
                            <Info className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm bg-white dark:bg-gray-900 border-cyan-200 dark:border-cyan-800">
                          <div className="space-y-2">
                            <p className="font-semibold text-cyan-600 dark:text-cyan-400">Question Relevance to Job Description</p>
                            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{getRelevanceExplanation(qa.relevance, qa.reasoning)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              
                {qa.answers.map((answer, answerIndex) => (
                  <div key={answerIndex} className="mt-4 ml-6 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      <MessageCircle className="inline text-purple-500 mr-2 h-4 w-4" />
                      <span className="text-sm">{answer.text.length > 200 ? answer.text.substring(0, 200) + "..." : answer.text}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap text-sm">
                      <span className="px-2 py-1 rounded-full bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">
                        Candidate • {answer.timestamp}
                      </span>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border cursor-help ${getBadgeColor(answer.jdMatch)}`} data-testid={`answer-match-badge-${index}-${answerIndex}`}>
                            <span className="text-xs font-medium">Answer Match: {getBadgeText(answer.jdMatch)}</span>
                            <Info className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm bg-white dark:bg-gray-900 border-cyan-200 dark:border-cyan-800">
                          <div className="space-y-2">
                            <p className="font-semibold text-cyan-600 dark:text-cyan-400">How Well Did They Answer the Question?</p>
                            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{getAnswerExplanation(answer.jdMatch, answer.reasoning)}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {qaAnalysis.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Conversation Analysis Yet</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Analysis will appear here once processing is complete.</p>
              </div>
            )}
          </div>
          
          {insights.length > 0 && (
            <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50" data-testid="insights-container">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <Lightbulb className="text-white h-4 w-4" />
                </div>
                Analysis Insights
              </h4>
              <ul className="space-y-3 text-sm">
                {insights.map((insight, index) => {
                  let displayText = '';
                  if (typeof insight === 'string') {
                    displayText = insight;
                  } else if (insight && typeof insight === 'object') {
                    displayText = (insight as any).description ||
                                 (insight as any).insight || 
                                 (insight as any).text || 
                                 (insight as any).content || 
                                 JSON.stringify(insight);
                  } else {
                    displayText = 'Unable to display insight';
                  }
                  
                  return (
                    <li key={index} data-testid={`insight-${index}`} className="flex items-start p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg">
                      <span className="text-amber-500 mr-3 font-bold">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{displayText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
