import type { BaseMeta, Marketplace } from '@shared/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useToast } from '../context/ToastContext.js';
import { fetchAllMarketplaces, mergeWithInstalled, type PackRow as UtilPackRow } from '../utils/packs.js';
import { isSameVersion } from '../utils/text.js';

export type PackRow = UtilPackRow & BaseMeta;

interface UsePacksListResult {
  packs: PackRow[];
  refreshing: boolean;
  installingId?: string;
  removingId?: string;
  errors: Record<string, string>;
  refresh: () => void;
  installPack: (pack: PackRow) => Promise<void>;
  removePack: (pack: PackRow) => Promise<void>;
}

export function usePacksList(marketplaces: Marketplace[] = []): UsePacksListResult {
  const toast = useToast();
  const [packs, setPacks] = useState<PackRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [installingId, setInstallingId] = useState<string>();
  const [removingId, setRemovingId] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasFetched, setHasFetched] = useState(false);

  const enabled = useMemo(() => marketplaces.filter((m) => m.enabled), [marketplaces]);
  const key = useMemo(() => enabled.map((m) => m.url).join('|'), [enabled]);

  const loadPacks = useCallback(
    async (force = false) => {
      if (enabled.length === 0 || refreshing || (!force && hasFetched)) return;
      setRefreshing(true);
      try {
        const installedRes = await window.projecthub.listPacks?.();
        const installed = installedRes?.ok && installedRes.data ? installedRes.data : [];
        const { packs: remotePacks, errors: fetchErrors } = await fetchAllMarketplaces(enabled);
        setPacks(mergeWithInstalled(remotePacks, installed) as PackRow[]);
        setErrors(fetchErrors);
        setHasFetched(true);
      } catch (err) {
        setErrors({ global: (err as Error).message || 'Failed to load packs' });
        setPacks([]);
        setHasFetched(true);
      } finally {
        setRefreshing(false);
      }
    },
    [enabled, refreshing, hasFetched]
  );

  useEffect(() => {
    setHasFetched(false);
    setErrors({});
    setPacks([]);
  }, [key]);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const refresh = useCallback(() => {
    if (refreshing) return;
    setHasFetched(false);
    setErrors({});
    loadPacks(true);
  }, [refreshing, loadPacks]);

  const installPack = useCallback(
    async (pack: PackRow) => {
      if (!pack.path || isSameVersion(pack.version, pack.installedVersion)) {
        if (isSameVersion(pack.version, pack.installedVersion)) toast('This version is already installed.', 'info');
        return;
      }
      if (!window.confirm(`Install pack "${pack.name}"? This downloads and adds its templates and libraries.`)) return;
      setInstallingId(pack.name);
      const res = await window.projecthub.installPack?.({ url: pack.path, checksum: pack.checksum });
      toast(res?.ok ? `Pack "${pack.name}" installed successfully` : res?.error || 'Failed to install pack', res?.ok ? 'success' : 'error');
      if (res?.ok) setHasFetched(false);
      setInstallingId(undefined);
    },
    [toast]
  );

  const removePack = useCallback(
    async (pack: PackRow) => {
      if (pack.status !== 'installed') return;
      if (!window.confirm(`Uninstall pack "${pack.name}"? This removes the pack and its templates from disk.`)) return;
      setRemovingId(pack.name);
      try {
        if (!window.projecthub.removePack) throw new Error('Remove pack API unavailable');
        const res = await window.projecthub.removePack({ name: pack.name, path: pack.localPath });
        if (!res.ok) throw new Error(res.error || 'Unknown error');
        toast(`Pack "${pack.name}" removed successfully`, 'success');
        setHasFetched(false);
      } catch (err) {
        toast(`Failed to remove pack: ${(err as Error).message}`, 'error');
      } finally {
        setRemovingId(undefined);
      }
    },
    [toast]
  );

  return { packs, refreshing, installingId, removingId, errors, refresh, installPack, removePack };
}
