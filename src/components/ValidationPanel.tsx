import { ValidationError } from '@/types/layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface ValidationPanelProps {
  errors: ValidationError[];
}

export const ValidationPanel = ({ errors }: ValidationPanelProps) => {
  if (errors.length === 0) {
    return (
      <div className="p-4 bg-sidebar border-l border-sidebar-border">
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-2 h-2 rounded-full bg-green-600" />
          <p className="text-sm font-medium">All validations passed</p>
        </div>
      </div>
    );
  }

  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  return (
    <div className="h-full flex flex-col bg-sidebar border-l border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sidebar-foreground">Validation</h2>
        <div className="flex gap-4 mt-2 text-xs">
          {errorCount > 0 && (
            <span className="text-destructive font-medium">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-amber-600 font-medium">
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {errors.map((error, index) => (
            <Alert
              key={index}
              variant={error.type === 'error' ? 'destructive' : 'default'}
              className={error.type === 'warning' ? 'border-amber-600' : ''}
            >
              {error.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              <AlertDescription className="text-xs">
                {error.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
