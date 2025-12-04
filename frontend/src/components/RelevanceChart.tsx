import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Target } from "lucide-react";

interface RelevanceChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
    icon?: string;
    details?: string;
    matchedSkills?: string[];
    missingSkills?: string[];
    yearsRequired?: number;
    yearsCandidate?: number;
  }>;
  title?: string;
}

export default function RelevanceChart({ data, title = "JD Relevance Breakdown" }: RelevanceChartProps) {
  const chartData = data;

  return (
    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-cyan-100 dark:border-cyan-900/50 overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
          {title}
        </h3>
        <div className="h-[320px]" data-testid="relevance-chart-container">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {chartData.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient-${index})`}
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth={2}
                      style={{
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-4 border border-cyan-200 dark:border-cyan-800 rounded-xl shadow-xl max-w-sm">
                          <div className="flex items-center space-x-3 mb-3">
                            {data.icon && (
                              <span className="text-2xl">{data.icon}</span>
                            )}
                            <div 
                              className="w-4 h-4 rounded-full shadow-sm" 
                              style={{ backgroundColor: data.color }}
                            ></div>
                            <span className="font-bold text-gray-900 dark:text-white">{data.name}</span>
                          </div>
                          <p className="text-3xl font-bold mb-2" style={{ color: data.color }}>
                            {data.value}%
                          </p>
                          {data.details && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                              {data.details}
                            </p>
                          )}
                          {data.matchedSkills && data.matchedSkills.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Matched Skills:</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{data.matchedSkills.join(', ')}</p>
                            </div>
                          )}
                          {data.missingSkills && data.missingSkills.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">Missing Skills:</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{data.missingSkills.join(', ')}</p>
                            </div>
                          )}
                          {data.yearsRequired !== undefined && data.yearsCandidate !== undefined && (
                            <div className="flex justify-between text-xs mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-gray-500 dark:text-gray-400">Required: {data.yearsRequired}+ years</span>
                              <span className="text-gray-500 dark:text-gray-400">Candidate: {data.yearsCandidate} years</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No JD Analysis Yet</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Job description relevance analysis will appear here once your interview audio is processed.
              </p>
            </div>
          )}
        </div>
        {chartData.length > 0 && (
          <>
            <div className="mt-6 space-y-3">
              {chartData.map((item, index) => (
                <div 
                  key={item.name} 
                  className="flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm" 
                  style={{ 
                    borderColor: `${item.color}40`
                  }}
                  data-testid={`relevance-item-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon && (
                      <span className="text-xl">{item.icon}</span>
                    )}
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                      {item.details && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span 
                      className="text-xl font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Overall JD Match</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)}%
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Average compatibility with job requirements
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
