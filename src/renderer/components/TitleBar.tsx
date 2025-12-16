import '../styles/titlebar.css';

import type { PlatformSettings, TitleBarIconConfig } from '@shared/types.js';
import { Settings } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ThemeToggle from './ThemeToggle.js';
import WindowButtons from './WindowButtons.js';

type TitleBarProps = {
  onOpenSettings: () => void;
};

const DEFAULT_ICONS: TitleBarIconConfig[] = [
  { ref: 'theme-toggle', action: 'theme-toggle', variant: 'titlebar' },
  { ref: 'settings', action: 'settings' }
];

const TitleBar: React.FC<TitleBarProps> = ({ onOpenSettings }) => {
  const [icons, setIcons] = useState<TitleBarIconConfig[]>(DEFAULT_ICONS);
  const [platform, setPlatform] = useState<PlatformSettings['platform']>('windows');
  const [isElectron, setIsElectron] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && Boolean(window.projecthub));
  }, []);

  useEffect(() => {
    if (!isElectron || !window.projecthub?.getPlatformSettings) {
      return;
    }

    let mounted = true;

    const loadSettings = async () => {
      try {
        const settings = await window.projecthub.getPlatformSettings();
        if (!mounted) return;

        const nextIcons = settings.titleBar.icons.length
          ? settings.titleBar.icons.map((icon) => ({ ...icon }))
          : DEFAULT_ICONS;
        setIcons(nextIcons);
        setPlatform(settings.platform);

        const state = await window.projecthub.windowControls.getState();
        if (mounted && state) {
          setIsMaximized(Boolean(state.isMaximized));
        }
      } catch {
        // Platform settings load failed - use defaults
      }
    };

    const cleanup = window.projecthub.onWindowMaximizeChanged?.((flag) => setIsMaximized(Boolean(flag)));

    loadSettings();

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [isElectron]);

  const handleWindowControl = useCallback((action: 'minimize' | 'toggle-maximize' | 'close') => {
    const controls = window.projecthub?.windowControls;
    if (!controls) return;

    switch (action) {
      case 'minimize':
        controls.minimize?.();
        break;
      case 'toggle-maximize':
        controls.toggleMaximize?.();
        break;
      case 'close':
        controls.close?.();
        break;
      default:
        break;
    }
  }, []);

  const themeAndSettingsIcons = useMemo(() => {
    const filtered = icons.filter((icon) => icon.action === 'theme-toggle' || icon.action === 'settings');

    filtered.sort((a, b) => {
      const order = ['theme-toggle', 'settings'];
      return order.indexOf(a.action) - order.indexOf(b.action);
    });

    return filtered;
  }, [icons]);

  const renderIconButton = (icon: TitleBarIconConfig) => {
    if (icon.action === 'theme-toggle') {
      return <ThemeToggle key={`${icon.action}-${icon.ref}`} variant={icon.variant ?? 'titlebar'} />;
    }

    if (icon.action === 'settings') {
      const label = icon.label ?? 'Open settings';
      const content =
        icon.ref === 'settings' ? (
          <Settings className="h-3 w-3" aria-hidden />
        ) : (
          <img src={icon.ref} alt={label} className="h-3 w-3" draggable={false} />
        );

      return (
        <button
          key={`${icon.action}-${icon.ref}`}
          type="button"
          aria-label={label}
          title={label}
          className="custom-title-bar__icon-button text-current"
          onClick={onOpenSettings}
        >
          {content}
        </button>
      );
    }

    return null;
  };

  const handleDoubleClick = () => handleWindowControl('toggle-maximize');

  if (!isElectron) {
    return null;
  }

  const platformClass = `custom-title-bar custom-title-bar--${platform}`;

  return (
    <header
      className={`${platformClass} fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-brand-surface-dark/90 text-brand-text-dark shadow-sm backdrop-blur`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="custom-title-bar__section custom-title-bar__left" />
      <div className="custom-title-bar__section custom-title-bar__center">
        <span className="titlebar-app-name">ProjectHub</span>
      </div>
      <div className="custom-title-bar__section custom-title-bar__right">
        <div className="custom-title-bar__actions">{themeAndSettingsIcons.map(renderIconButton)}</div>
        {platform !== 'mac' ? (
          <WindowButtons
            isMaximized={isMaximized}
            onMinimize={() => handleWindowControl('minimize')}
            onToggleMaximize={() => handleWindowControl('toggle-maximize')}
            onClose={() => handleWindowControl('close')}
          />
        ) : null}
      </div>
    </header>
  );
};

export default TitleBar;
