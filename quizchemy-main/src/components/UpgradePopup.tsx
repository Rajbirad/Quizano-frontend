import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const UpgradePopup: React.FC<UpgradePopupProps> = ({ 
  isOpen, 
  onClose, 
  message = "You're out of free trials for this month. Upgrade to get more!" 
}) => {
  console.log('🚀 [UpgradePopup] Render called, isOpen:', isOpen);
  
  // Add effect to track when popup should stay open
  React.useEffect(() => {
    if (isOpen) {
      console.log('🎯 [UpgradePopup] Popup mounted and should be visible');
      
      // Prevent any automatic closure
      const preventAutoClose = () => {
        console.log('🛡️ [UpgradePopup] Preventing auto close');
      };
      
      // Set up a timer to check if popup is still open after a few seconds
      const checkTimer = setTimeout(() => {
        if (isOpen) {
          console.log('✅ [UpgradePopup] Still open after 3 seconds - good!');
        }
      }, 3000);
      
      return () => {
        clearTimeout(checkTimer);
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleUpgrade = () => {
    console.log('💳 [UpgradePopup] Upgrade button clicked');
    // You can customize this URL or action based on your pricing page
    window.open('/pricing', '_blank');
  };

  const handleClose = () => {
    console.log('❌ [UpgradePopup] Close button clicked');
    console.trace('🔍 [UpgradePopup] Stack trace for handleClose:');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('🖱️ [UpgradePopup] Backdrop clicked');
    console.trace('🔍 [UpgradePopup] Stack trace for handleBackdropClick:');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <img src="/icons/increase.svg" alt="Upgrade" className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade to continue
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action button */}
            <div>
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                View Plans & Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};