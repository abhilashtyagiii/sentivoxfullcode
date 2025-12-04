import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine, Area, AreaChart } from "recharts";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SentimentChartProps {
  data: Array<{
    time: string;
    recruiter: number;
    candidate: number;
  }>;
  onPointClick?: (timestamp: string) => void;
}

export default function SentimentChart({ data, onPointClick }: SentimentChartProps) {
  const chartData = data;

  const recruiterTrend = chartData.length > 1 ? 
    chartData[chartData.length - 1].recruiter - chartData[0].recruiter : 0;
  const candidateTrend = chartData.length > 1 ?
    chartData[chartData.length - 1].candidate - chartData[0].candidate : 0;

  const handleClick = (e: any) => {
    if (e && e.activePayload && e.activePayload[0]) {
      const timestamp = e.activeLabel;
      if (onPointClick && timestamp) {
        onPointClick(timestamp);
      }
    }
  };

  return (
    <TooltipProvider>
      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-cyan-100 dark:border-cyan-900/50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                Sentiment Analysis Over Time
              </h3>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help hover:text-cyan-500 transition-colors" data-testid="info-icon-sentiment-chart" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white dark:bg-gray-900 border-cyan-200 dark:border-cyan-800" side="top">
                  <div className="space-y-2">
                    <p className="font-semibold text-cyan-600 dark:text-cyan-400">Sentiment Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tracks emotional tone throughout the interview. Click on any point to jump to that moment in the transcript.</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      Scores above 7 indicate positive, engaging conversation
                    </p>
                  </div>
                </TooltipContent>
              </UITooltip>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-sm shadow-cyan-400/50"></div>
                <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Recruiter</span>
                {recruiterTrend !== 0 && (
                  recruiterTrend > 0 ? 
                    <TrendingUp className="h-4 w-4 text-emerald-500" /> :
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full shadow-sm shadow-purple-400/50"></div>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Candidate</span>
                {candidateTrend !== 0 && (
                  candidateTrend > 0 ? 
                    <TrendingUp className="h-4 w-4 text-emerald-500" /> :
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                )}
              </div>
            </div>
          </div>
          <div className="h-[300px]" data-testid="sentiment-chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} onClick={handleClick} className="cursor-pointer">
                  <defs>
                    <linearGradient id="recruiterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="candidateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    ticks={[0, 3, 5, 7, 10]}
                  />
                  <ReferenceLine y={7} stroke="#10b981" strokeDasharray="5 5" opacity={0.4} />
                  <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="5 5" opacity={0.4} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 border border-cyan-200 dark:border-cyan-800 rounded-xl shadow-xl">
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Time: {label}</p>
                            <p className="text-xs text-cyan-500 mb-3">Click to view transcript</p>
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center space-x-2 mb-1">
                                <div 
                                  className="w-3 h-3 rounded-full shadow-sm" 
                                  style={{ backgroundColor: entry.color }}
                                ></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {entry.name}: <span className="font-semibold text-gray-900 dark:text-white">{entry.value}/10</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="recruiter"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fill="url(#recruiterGradient)"
                    dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4, cursor: 'pointer' }}
                    activeDot={{ r: 7, fill: "#0891b2", stroke: "#ffffff", strokeWidth: 2, cursor: 'pointer' }}
                    name="Recruiter"
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="candidate"
                    stroke="#a855f7"
                    strokeWidth={3}
                    fill="url(#candidateGradient)"
                    dot={{ fill: "#a855f7", strokeWidth: 2, r: 4, cursor: 'pointer' }}
                    activeDot={{ r: 7, fill: "#9333ea", stroke: "#ffffff", strokeWidth: 2, cursor: 'pointer' }}
                    name="Candidate"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
                  <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Sentiment Analysis Yet</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Sentiment analysis over time will appear here once your interview audio is processed.
                </p>
              </div>
            )}
          </div>
          
          {chartData.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Recruiter</span>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {(chartData.reduce((sum, item) => sum + item.recruiter, 0) / chartData.length).toFixed(1)}/10
                </p>
                <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-1">Average Sentiment</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Candidate</span>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {(chartData.reduce((sum, item) => sum + item.candidate, 0) / chartData.length).toFixed(1)}/10
                </p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Average Sentiment</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
