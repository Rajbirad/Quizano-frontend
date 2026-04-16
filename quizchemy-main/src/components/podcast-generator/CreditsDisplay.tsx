import React from 'react';
import { CreditsInfo, formatCreditsDisplay } from '@/utils/credits';
import { AlertCircle, Zap } from 'lucide-react';

interface CreditsDisplayProps {
  credits: CreditsInfo | null;
  showAlert?: boolean;
  compact?: boolean;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ credits, showAlert = false, compact = false }) => {
  if (!credits) {
    return null;
  }

  const displayText = formatCreditsDisplay(credits);
  const isLowBalance = !credits.unlimited && credits.balance < 50; // Alert if less than 50 credits

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Zap className="h-4 w-4" />
        <span className="font-medium">{displayText}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Credits: {displayText}
          </div>
          {credits.transaction_id && (
            <div className="text-xs text-blue-700 dark:text-blue-300">
              Transaction ID: {credits.transaction_id}
            </div>
          )}
        </div>
      </div>

      {showAlert && isLowBalance && !credits.unlimited && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div className="text-sm text-yellow-800 dark:text-yellow-100">
            Your credit balance is running low. Consider upgrading your plan.
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditsDisplay;
