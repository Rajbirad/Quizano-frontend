import React, { useState } from 'react';
import { PricingModal } from '@/components/PricingModal';

interface CreditsButtonProps {
  balance?: number | null;
  isLoading?: boolean;
  isUnlimited?: boolean;
}

export const CreditsButton: React.FC<CreditsButtonProps> = ({ balance, isLoading, isUnlimited }) => {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const balanceLabel = isLoading
    ? 'Balance: Loading...'
    : isUnlimited
    ? 'Balance: \u221e Unlimited'
    : `Balance: ${balance ?? '\u2014'}`;

  return (
    <>
      <div className="flex items-center gap-5 text-sm font-medium">
        <span>{balanceLabel}</span>
        <button
          onClick={() => setShowUpgrade(true)}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm"
        >
          Get more credits
        </button>
      </div>
      <PricingModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
};
