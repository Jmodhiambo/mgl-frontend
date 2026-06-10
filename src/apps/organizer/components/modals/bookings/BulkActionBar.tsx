// src/organizer/components/BulkActionBar.tsx
import React from 'react';
import { CheckCircle, Mail, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  isBulkMode: boolean;
  onEnterBulkMode: () => void;
  onClearSelection: () => void;
  onBulkEmail: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  isBulkMode,
  onEnterBulkMode,
  onClearSelection,
  onBulkEmail
}) => {
  // Show trigger button when not in bulk mode
  if (!isBulkMode) {
  return (
    <div className="mb-6 flex justify-end">
      <button
        onClick={onEnterBulkMode}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md"
      >
        <Mail className="w-5 h-5" />
        Send Bulk Email
      </button>
    </div>
  );
}

  // Show selection bar when in bulk mode
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">
              {selectedCount} booking{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={onClearSelection}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel & Clear
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onBulkEmail}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-4 h-4" />
            Send to Selected ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;