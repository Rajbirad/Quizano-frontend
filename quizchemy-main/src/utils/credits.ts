/**
 * Credits utility functions for handling API credits and balance checks
 */

export interface CreditsInfo {
  cost: number;
  balance: number;
  unlimited: boolean;
  transaction_id?: string;
}

export interface ApiResponseWithCredits {
  credits?: CreditsInfo;
  [key: string]: any;
}

/**
 * Extract credits information from API response
 */
export const extractCredits = (data: ApiResponseWithCredits): CreditsInfo | null => {
  return data?.credits || null;
};

/**
 * Check if user has sufficient credits for the operation
 */
export const hasSufficientCredits = (data: ApiResponseWithCredits): boolean => {
  const credits = extractCredits(data);
  
  if (!credits) {
    // If no credits info, assume it's okay (backward compatibility)
    return true;
  }
  
  // If unlimited, user can proceed
  if (credits.unlimited) {
    return true;
  }
  
  // Check if balance is sufficient (should be non-negative after deduction)
  return credits.balance >= 0;
};

/**
 * Get a user-friendly error message for credit-related issues
 */
export const getCreditErrorMessage = (data: ApiResponseWithCredits): string | null => {
  const credits = extractCredits(data);
  
  if (!credits) {
    return null;
  }
  
  if (!credits.unlimited && credits.balance < 0) {
    const shortfall = Math.abs(credits.balance);
    return `Insufficient credits. You need ${shortfall} more credits. Current cost: ${credits.cost} credits. Please upgrade your plan or purchase more credits.`;
  }
  
  return null;
};

/**
 * Format credits for display
 */
export const formatCreditsDisplay = (credits: CreditsInfo | null): string => {
  if (!credits) {
    return 'Credits info unavailable';
  }
  
  if (credits.unlimited) {
    return 'Unlimited';
  }
  
  return `${credits.balance} / Transaction: ${credits.cost}`;
};

/**
 * Validate API response for credits-related errors
 * Returns error message if there's an issue, null otherwise
 */
export const validateCreditsInResponse = (data: ApiResponseWithCredits): string | null => {
  const credits = extractCredits(data);
  
  if (!credits) {
    return null;
  }
  
  // Check for insufficient balance
  if (!credits.unlimited && credits.balance < 0) {
    return getCreditErrorMessage(data);
  }
  
  return null;
};
