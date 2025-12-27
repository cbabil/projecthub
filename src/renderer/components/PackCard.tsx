import { BadgeCheck, Check, Download, Info, Loader2, Package, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Popover } from 'ui-toolkit';

import type { PackRow } from '../hooks/usePacksList.js';

interface Props {
  pack: PackRow;
  installing?: boolean;
  removing?: boolean;
  onInstall: () => void;
  onRemove: () => void;
}

const PackCard: React.FC<Props> = ({ pack, installing, removing, onInstall, onRemove }) => {
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const isInstalled = pack.status === 'installed';
  const hasUpdate = isInstalled && pack.installedVersion && pack.version && pack.installedVersion !== pack.version;
  const isLoading = installing || removing;
  const isOfficial = pack.marketplaceId === 'official';

  return (
    <div className="relative bg-white/5 border border-brand-divider/40 rounded-lg px-2.5 py-3 flex flex-col gap-2 hover:border-brand-accent-primary/50 transition-colors min-h-[140px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package size={18} className="text-brand-accent-primary" />
          <span className="text-sm font-medium text-white truncate ml-1.5">{pack.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            ref={infoRef}
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <Info size={14} className="text-blue-400 cursor-help" aria-label="Pack info" />
          </div>
          <Popover open={showInfo} onClose={() => setShowInfo(false)} anchorRef={infoRef}>
              <div className="flex flex-col gap-2 text-xs">
                <div className="font-medium text-white">{pack.name}</div>
                <p className="text-white/70">{pack.description || 'No description'}</p>
                <div className="border-t border-white/20 pt-2 mt-1 space-y-1">
                  {pack.technology && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Technology</span>
                      <span className="text-white">{pack.technology}</span>
                    </div>
                  )}
                  {pack.category && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Category</span>
                      <span className="text-white">{pack.category}</span>
                    </div>
                  )}
                  {pack.license && pack.license !== '-' && (
                    <div className="flex justify-between">
                      <span className="text-white/60">License</span>
                      <span className="text-white">{pack.license}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/60">Version</span>
                    <span className="text-white">{pack.version}</span>
                  </div>
                  {pack.releasedOn && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Released</span>
                      <span className="text-white">{new Date(pack.releasedOn).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popover>
          {isInstalled && <Check size={14} className="text-green-400" />}
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px]">
        {isOfficial ? (
          <>
            <BadgeCheck size={10} className="text-brand-accent-primary" />
            <span className="text-brand-accent-primary font-medium">Official</span>
          </>
        ) : (
          <span className="text-brand-text-dark/60">@{pack.marketplaceName || 'unknown'}</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {pack.category && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-brand-accent-primary/20 text-brand-accent-primary rounded">
              {pack.category}
            </span>
          )}
          {pack.technology && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-white/10 text-white/70 rounded">
              {pack.technology}
            </span>
          )}
        </div>
        {pack.releasedOn && (
          <span className="text-[10px] text-brand-text-dark/50">
            Released {new Date(pack.releasedOn).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] text-brand-text-dark/50">
          {isInstalled && hasUpdate ? (
            <span className="text-amber-400">v{pack.installedVersion} → v{pack.version}</span>
          ) : (
            <span>v{pack.version}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isInstalled && (
            <button
              type="button"
              onClick={onRemove}
              disabled={isLoading}
              className="p-1 text-brand-text-dark/50 hover:text-brand-accent-red rounded transition-colors disabled:opacity-50"
              aria-label="Remove pack"
            >
              {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          )}

          {hasUpdate ? (
            <button
              type="button"
              onClick={onInstall}
              disabled={isLoading}
              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors disabled:opacity-50"
              aria-label="Update pack"
            >
              {installing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            </button>
          ) : !isInstalled ? (
            <button
              type="button"
              onClick={onInstall}
              disabled={isLoading}
              className="p-1.5 bg-brand-accent-primary hover:bg-brand-accent-primary/80 text-white rounded transition-colors disabled:opacity-50"
              aria-label="Install pack"
            >
              {installing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PackCard;
