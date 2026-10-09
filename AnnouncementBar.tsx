import React, { useState } from 'react';
import { Announcement } from '../types';
import { X, ArrowRight, Tag, Info, AlertTriangle } from 'lucide-react';

interface Props {
  announcement: Announcement;
  onNavigateCatalog: () => void;
}

export const AnnouncementBar: React.FC<Props> = ({ announcement, onNavigateCatalog }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement.isActive || dismissed) {
    return null;
  }

  const getIcon = () => {
    switch (announcement.type) {
      case 'sale':
        return <Tag className="w-3.5 h-3.5 shrink-0" />;
      case 'alert':
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  const getBgStyle = () => {
    switch (announcement.type) {
      case 'sale':
        return 'bg-amber-500 text-slate-950 font-medium';
      case 'alert':
        return 'bg-rose-600 text-white font-medium';
      default:
        return 'bg-slate-900 text-slate-100';
    }
  };

  return (
    <div className={`py-2 px-4 text-xs transition-colors relative z-40 ${getBgStyle()}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 mx-auto truncate">
          {getIcon()}
          <span className="truncate">{announcement.text}</span>
          {announcement.actionText && (
            <button
              onClick={onNavigateCatalog}
              className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold ml-2 cursor-pointer shrink-0"
            >
              {announcement.actionText}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:opacity-75 transition-opacity cursor-pointer shrink-0"
          title="Dismiss announcement"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
