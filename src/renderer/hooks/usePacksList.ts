import type { BaseMeta, PackMeta } from '@shared/types';
import { useCallback, useEffect, useState } from 'react';

import { useToast } from '../context/ToastContext.js';
import { fetchPackList } from '../utils/packs.js';
import { isSameVersion } from '../utils/text.js';

export type PackRow = PackMeta &
  BaseMeta & {
    installedVersion?: string;
  };

interface UsePacksListResult {
  packs: PackRow[];
  refreshing: boolean;
  installingId?: string;
  removingId?: string;
  error?: string;
  refresh: () => void;
  installPack: (pack: PackRow) => Promise<void>;
  removePack: (pack: PackRow) => Promise<void>;
}

export function usePacksList(repoUrl?: string): UsePacksListResult {
  const toast = useToast();
  const [packs, setPacks] = useState<PackRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [installingId, setInstallingId] = useState<string>();
  const [removingId, setRemovingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [hasFetched, setHasFetched] = useState(false);

  const loadPacks = useCallback(
    async (force = false) => {
      if (!repoUrl || refreshing) return;
      if (!force && hasFetched) return;
      setRefreshing(true);
      try {
        const installedRes = await window.projecthub.listPacks?.();
        const installed = installedRes?.ok && installedRes.data ? installedRes.data : [];
        const normalize = (name?: string) => (name || '').replace(/\.zip$/i, '').toLowerCase();
        const list = await fetchPackList(repoUrl);
        const filtered = list.filter((p) => {
          const name = String(p.name || '').toLowerCase();
          const path = String(p.path || '').toLowerCase();
          const isJson = name.endsWith('.json') || path.endsWith('.json');
          return !isJson;
        });
        const merged: PackRow[] = filtered.map((p) => {
          const installedMatch = installed.find((i) => normalize(i.name) === normalize(p.name));
          const isInstalled = Boolean(installedMatch);
          const installedVersion = installedMatch?.version;
          return {
            ...p,
            name: p.name || '-',
            description: p.description || '-',
            version: p.version || '-',
            localPath: installedMatch?.path,
            status: isInstalled ? 'installed' : 'missing',
            installedVersion,
            lastEdited: p.releasedOn || ''
          } as PackRow;
        });
        setPacks(merged);
        setError(undefined);
        setHasFetched(true);
      } catch (err) {
        const msg = (err as Error).message || 'Failed to load packs';
        if (msg.includes('403') || msg.includes('429')) {
          setError('Cannot fetch packs (GitHub rate limit). Try again later or point packsRepoUrl to a local manifest.');
        } else {
          setError(msg);
        }
        setPacks([]);
        setHasFetched(true);
      } finally {
        setRefreshing(false);
      }
    },
    [repoUrl, refreshing, hasFetched]
  );

  useEffect(() => {
    setHasFetched(false);
    setError(undefined);
    setPacks([]);
  }, [repoUrl]);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const refresh = useCallback(() => {
    if (refreshing) return;
    setHasFetched(false);
    setError(undefined);
    loadPacks(true);
  }, [refreshing, loadPacks]);

  const installPack = useCallback(
    async (pack: PackRow) => {
      if (!pack.path) return;
      if (isSameVersion(pack.version, pack.installedVersion)) {
        toast('This version is already installed.', 'info');
        return;
      }
      const confirmed = window.confirm(
        `Install pack "${pack.name}" from the repository? This will download and add all of its templates and libraries.`
      );
      if (!confirmed) return;
      setInstallingId(pack.name);
      const res = await window.projecthub.installPack?.({ url: pack.path, checksum: pack.checksum });
      if (!res?.ok) {
        toast(res?.error || 'Failed to install pack', 'error');
      } else {
        toast(`Pack "${pack.name}" installed successfully`, 'success');
        setHasFetched(false);
      }
      setInstallingId(undefined);
    },
    [toast]
  );

  const removePack = useCallback(
    async (pack: PackRow) => {
      if (pack.status !== 'installed') return;
      const confirmed = window.confirm(
        `Uninstall pack "${pack.name}"? This removes the entire pack and all of its templates from disk.`
      );
      if (!confirmed) return;
      setRemovingId(pack.name);
      try {
        if (!window.projecthub.removePack) throw new Error('Remove pack API unavailable (restart may be required)');
        const res = await window.projecthub.removePack({ name: pack.name, path: pack.localPath });
        if (!res.ok) throw new Error(res.error || 'Unknown error from main process');
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

  return {
    packs,
    refreshing,
    installingId,
    removingId,
    error,
    refresh,
    installPack,
    removePack
  };
}
