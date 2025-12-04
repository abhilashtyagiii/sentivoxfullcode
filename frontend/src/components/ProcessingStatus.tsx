import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, Settings, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessingStep } from "@/lib/types";

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  isVisible: boolean;
}

export default function ProcessingStatus({ steps, isVisible }: ProcessingStatusProps) {
  if (!isVisible || steps.length === 0) return null;

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-chart-2" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <span className="text-muted-foreground text-sm">○</span>;
    }
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'complete':
        return 'text-chart-2';
      case 'processing':
        return 'text-primary';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const completedSteps = steps.filter(s => s.status === 'complete').length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="mb-8 transition-all duration-300 hover:shadow-lg" data-testid="processing-status-container">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="text-primary mr-2 h-5 w-5" />
              Processing Interview
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {completedSteps} / {totalSteps} steps
            </span>
          </h2>
          <div className="mt-3 w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => {
            return (
              <div 
                key={index} 
                className={cn(
                  "flex items-start space-x-4 p-3 rounded-lg transition-all duration-300",
                  step.status === 'processing' && 'bg-primary/5 ring-2 ring-primary/20',
                  step.status === 'complete' && 'bg-chart-2/5',
                  step.status === 'error' && 'bg-destructive/5'
                )}
                data-testid={`processing-step-${index}`}
              >
                <div className="w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground" data-testid={`step-name-${index}`}>
                    {step.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1" data-testid={`step-message-${index}`}>
                    {step.message}
                  </p>
                </div>
                <span className={cn(
                  "text-sm font-medium capitalize flex-shrink-0",
                  getStatusColor(step.status)
                )}>
                  {step.status === 'processing' && 'Processing...'}
                  {step.status === 'complete' && '✓'}
                  {step.status === 'error' && 'Error'}
                  {step.status === 'pending' && '○'}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
