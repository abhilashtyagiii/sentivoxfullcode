import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, TrendingUp, Target, AlertTriangle, CheckCircle2, Star, HelpCircle, MessageSquare, Quote } from "lucide-react";

interface MissedFollowUp {
  afterNode: string;
  suggestedQuestion: string;
  suggestedQuestions?: string[];
  importance: "high" | "medium" | "low";
  reasoning: string;
  specificContext?: string;
  answerExcerpt?: string;
  followUpType?: "technical_depth" | "behavioral" | "clarification" | "project_details" | "quantification" | "team_collaboration";
}

interface TrainingRecommendation {
  area: string;
  priority: "critical" | "high" | "medium" | "low";
  issue: string;
  recommendation: string;
  resources: string[];
  expectedImprovement: string;
  missedFollowUps?: MissedFollowUp[];
}

interface PerformanceGap {
  metric: string;
  currentScore: number;
  targetScore: number;
  gap: number;
  severity: "critical" | "moderate" | "minor";
}

interface TrainingRecommendationsProps {
  recommendations?: TrainingRecommendation[];
  performanceGaps?: PerformanceGap[];
  strengthAreas?: string[];
  overallRating?: "excellent" | "good" | "needs_improvement" | "poor";
}

export default function TrainingRecommendations({
  recommendations = [],
  performanceGaps = [],
  strengthAreas = [],
  overallRating
}: TrainingRecommendationsProps) {
  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      critical: { variant: "destructive", className: "bg-gradient-to-r from-rose-500 to-red-500" },
      high: { variant: "default", className: "bg-gradient-to-r from-amber-500 to-orange-500" },
      medium: { variant: "secondary", className: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" },
      low: { variant: "outline", className: "" }
    };
    return variants[priority] || variants.medium;
  };

  const getRatingBadge = (rating?: string) => {
    const variants: Record<string, { variant: any; text: string; icon: any; className: string }> = {
      excellent: { variant: "default", text: "Excellent Performance", icon: <Star className="h-4 w-4 fill-current" />, className: "bg-gradient-to-r from-emerald-500 to-cyan-500" },
      good: { variant: "secondary", text: "Good Performance", icon: <CheckCircle2 className="h-4 w-4" />, className: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" },
      needs_improvement: { variant: "outline", text: "Needs Improvement", icon: <TrendingUp className="h-4 w-4" />, className: "" },
      poor: { variant: "destructive", text: "Requires Attention", icon: <AlertTriangle className="h-4 w-4" />, className: "" }
    };
    return variants[rating || ""] || null;
  };

  if (recommendations.length === 0 && strengthAreas.length === 0) {
    return null;
  }

  const ratingBadge = getRatingBadge(overallRating);

  return (
    <div className="space-y-6" data-testid="training-recommendations-section">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            Recruiter Training & Development
          </h3>
        </div>
        {ratingBadge && (
          <div className="flex items-center gap-1">
            <Badge variant={ratingBadge.variant} className={`${ratingBadge.className}`} data-testid="overall-rating-badge">
              {ratingBadge.text}
            </Badge>
          </div>
        )}
      </div>

      {strengthAreas.length > 0 && (
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-emerald-200 dark:border-emerald-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              Areas of Strength
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <ul className="space-y-3">
              {strengthAreas.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/40 rounded-xl" data-testid={`strength-${index}`}>
                  <Star className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {performanceGaps.length > 0 && (
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-amber-200 dark:border-amber-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <Target className="h-4 w-4 text-white" />
              </div>
              Performance Gaps
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              These metrics show areas where your interview performance can be improved. Scores are out of 100, and gaps show how many points below the target you currently are.
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {performanceGaps.map((gap, index) => {
                const getExplanation = (metric: string, gapData: PerformanceGap) => {
                  if (metric.toLowerCase().includes('jd relevance')) {
                    return `Your questions currently align ${gapData.currentScore}% with the job description. Aim for ${gapData.targetScore}% by asking more questions that directly assess the specific skills, experience, and qualifications listed in the job posting.`;
                  } else if (metric.toLowerCase().includes('follow-up')) {
                    return `You're missing opportunities to dig deeper into candidate responses. Increase your follow-up rate by ${gapData.gap} points through probing questions when candidates mention projects, experiences, or skills.`;
                  } else if (metric.toLowerCase().includes('depth')) {
                    return `Your questions need more depth to properly assess candidates. Move from surface-level questions to ones that reveal true competency, problem-solving ability, and real-world application of skills.`;
                  } else if (metric.toLowerCase().includes('behavioral')) {
                    return `Include more behavioral questions using the STAR method (Situation, Task, Action, Result) to understand how candidates have handled real situations in the past.`;
                  }
                  return `This area needs improvement. Work to close the ${gapData.gap}-point gap through focused practice and training.`;
                };

                return (
                  <div key={index} className="border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-4 space-y-3 bg-white/60 dark:bg-gray-800/40" data-testid={`performance-gap-${index}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{gap.metric}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">{gap.currentScore}</span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${gap.currentScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{gap.targetScore}</span>
                        </div>
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Gap: {gap.gap} points to improve</p>
                      </div>
                      <Badge className={`ml-4 ${
                        gap.severity === "critical" ? "bg-gradient-to-r from-rose-500 to-red-500 text-white" :
                        gap.severity === "moderate" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" :
                        "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      }`}>
                        {gap.severity}
                      </Badge>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                      <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300 mb-1">What this means:</p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400">
                        {getExplanation(gap.metric, gap)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Action Plan & Recommendations
          </h4>
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              data-testid={`recommendation-${index}`} 
              className={`bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl border p-5 ${
                rec.priority === "critical" ? "border-rose-300 dark:border-rose-800" :
                rec.priority === "high" ? "border-amber-300 dark:border-amber-800" : 
                "border-cyan-200 dark:border-cyan-800/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  rec.priority === "critical" ? "bg-gradient-to-br from-rose-500 to-red-500" :
                  rec.priority === "high" ? "bg-gradient-to-br from-amber-500 to-orange-500" :
                  "bg-gradient-to-br from-cyan-500 to-blue-500"
                }`}>
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white">{rec.area}</h5>
                    <Badge className={getPriorityBadge(rec.priority).className} data-testid={`priority-badge-${index}`}>
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Issue:</p>
                      <p className="text-gray-600 dark:text-gray-400">{rec.issue}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Recommendation:</p>
                      <p className="text-gray-600 dark:text-gray-400">{rec.recommendation}</p>
                    </div>
                    
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">Expected Improvement:</p>
                      <p className="text-emerald-600 dark:text-emerald-400">{rec.expectedImprovement}</p>
                    </div>
                    
                    {rec.resources.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Training Resources:</p>
                        <ul className="space-y-2">
                          {rec.resources.map((resource, rIndex) => (
                            <li key={rIndex} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <BookOpen className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400">{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rec.missedFollowUps && rec.missedFollowUps.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-purple-500" />
                          Specific Missed Opportunities ({rec.missedFollowUps.length})
                        </p>
                        <Accordion type="single" collapsible className="w-full">
                          {rec.missedFollowUps.map((followUp, fIndex) => (
                            <AccordionItem key={fIndex} value={`followup-${fIndex}`} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                              <AccordionTrigger className="text-sm hover:no-underline py-3">
                                <div className="flex items-center gap-2 text-left">
                                  <Badge className={`text-xs ${
                                    followUp.importance === "high" ? "bg-gradient-to-r from-rose-500 to-red-500 text-white" :
                                    followUp.importance === "medium" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" :
                                    "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                                  }`}>
                                    {followUp.importance.toUpperCase()}
                                  </Badge>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {followUp.followUpType === "technical_depth" && "Technical Depth"}
                                    {followUp.followUpType === "behavioral" && "Behavioral/STAR"}
                                    {followUp.followUpType === "project_details" && "Project Details"}
                                    {followUp.followUpType === "quantification" && "Quantification"}
                                    {followUp.followUpType === "clarification" && "Clarification"}
                                    {followUp.followUpType === "team_collaboration" && "Team Collaboration"}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="text-sm space-y-3 pt-2">
                                {followUp.specificContext && (
                                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Context:</p>
                                    <p className="text-gray-700 dark:text-gray-300">{followUp.specificContext}</p>
                                  </div>
                                )}
                                
                                {followUp.answerExcerpt && (
                                  <div className="border-l-4 border-purple-400 pl-3">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                      <Quote className="h-3 w-3" />
                                      Candidate's Answer:
                                    </p>
                                    <p className="text-sm italic text-gray-600 dark:text-gray-400">{followUp.answerExcerpt}</p>
                                  </div>
                                )}
                                
                                <div>
                                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Why This Matters:</p>
                                  <p className="text-gray-600 dark:text-gray-400">{followUp.reasoning}</p>
                                </div>
                                
                                {followUp.suggestedQuestions && followUp.suggestedQuestions.length > 0 ? (
                                  <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3 text-cyan-500" />
                                      Suggested Follow-up Questions:
                                    </p>
                                    <ul className="space-y-2">
                                      {followUp.suggestedQuestions.map((q, qIndex) => (
                                        <li key={qIndex} className="flex items-start gap-2 bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                                          <span className="text-cyan-600 dark:text-cyan-400 font-bold shrink-0">{qIndex + 1}.</span>
                                          <span className="text-cyan-800 dark:text-cyan-200">"{q}"</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg border border-cyan-200/50 dark:border-cyan-800/50">
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Suggested Question:</p>
                                    <p className="text-cyan-800 dark:text-cyan-200">"{followUp.suggestedQuestion}"</p>
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
