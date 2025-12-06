/* eslint-disable max-lines, max-lines-per-function */
import type { BaseMeta, PackMeta } from '@shared/types';
import { Download, Loader2, Package, RefreshCw, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { fetchPackList } from '../../utils/packs.js';
import Grid from '../Grid.js';
import Search from '../Search.js';

type Props = {
  repoUrl?: string;
};

type PackRow = PackMeta &
  BaseMeta & {
    installedVersion?: string;
  };

const SettingsPacksTab: React.FC<Props> = ({ repoUrl }) => {
  const [packs, setPacks] = useState<PackRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [installingId, setInstallingId] = useState<string>();
  const [removingId, setRemovingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [hasFetched, setHasFetched] = useState(false);

  const loadPacks = async (force = false) => {
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
  };

  useEffect(() => {
    // reset when repoUrl changes
    setHasFetched(false);
    setError(undefined);
    setPacks([]);
  }, [repoUrl]);

  useEffect(() => {
    loadPacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoUrl, hasFetched]);

  const showInlineLoading = refreshing && packs.length === 0 && !error;

  const isSameVersion = (remote?: string, installed?: string) => {
    if (!remote || !installed) return false;
    const toParts = (v: string) => v.split('.').map((n) => parseInt(n, 10));
    const [a1, a2 = 0, a3 = 0] = toParts(remote);
    const [b1, b2 = 0, b3 = 0] = toParts(installed);
    return a1 === b1 && a2 === b2 && a3 === b3;
  };

const handleInstallPack = async (pack: PackRow) => {
    if (!pack.path) return;
    if (isSameVersion(pack.version, pack.installedVersion)) {
      alert('This version is already installed.');
      return;
    }
    const confirmed = window.confirm(
      `Install pack "${pack.name}" from the repository? This will download and add all of its templates and libraries.`
    );
    if (!confirmed) return;
    setInstallingId(pack.name);
    const res = await window.projecthub.installPack?.({ url: pack.path, checksum: pack.checksum });
    if (!res?.ok) {
      alert(res?.error || 'Failed to install pack');
    } else {
      setHasFetched(false);
    }
    setInstallingId(undefined);
  };

  const handleRemovePack = async (pack: PackRow) => {
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
      setHasFetched(false);
    } catch (err) {
      alert(`Failed to remove pack: ${(err as Error).message}`);
    } finally {
      setRemovingId(undefined);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 overflow-hidden">
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm text-brand-text-dark/70">Pull the latest packs from GitHub releases.</p>
        <button
          type="button"
          className="text-sm text-brand-text-dark/70 hover:text-white inline-flex items-center gap-2 disabled:opacity-40"
          onClick={() => {
            if (refreshing) return;
            setHasFetched(false);
            setError(undefined);
            loadPacks(true);
          }}
          disabled={refreshing}
        >
          {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      <Search value="" onChange={() => {}} placeholder="Search packs" className="mb-3" />
      <Grid
        items={packs.map(
          (p) =>
            ({
              ...p,
              type: 'project',
              lastEdited: p.releasedOn ?? '',
              description: p.description ?? p.summary ?? '-',
              version: p.version ?? '-'
            } as PackMeta & BaseMeta)
        )}
        columns={[
          { id: 'name', label: 'Name', accessor: (row) => row.name ?? '-', sortable: true, sortValue: (row) => row.name ?? '-', width: '120px' },
          { id: 'description', label: 'Description', accessor: (row) => row.description ?? '-', sortable: true, sortValue: (row) => row.description ?? '-', width: '310px' },
          {
            id: 'installedVersion',
            label: 'Installed',
            accessor: (row) => (
              <div className="w-full text-center">{row.installedVersion ?? '—'}</div>
            ),
            sortable: true,
            sortValue: (row) => row.installedVersion ?? '',
            width: '80px'
          },
          {
            id: 'version',
            label: 'Version',
            accessor: (row) => (
              <div
                className={`w-full text-center ${
                  row.installedVersion && row.version && row.installedVersion !== row.version ? 'text-amber-400' : ''
                }`}
              >
                {row.version ?? '-'}
              </div>
            ),
            sortable: true,
            sortValue: (row) => row.version ?? '-',
            width: '80px'
          },
          {
            id: 'releasedOn',
            label: 'Released On',
            accessor: (row) => (
              <div className="w-full text-center">{row.releasedOn ? new Date(row.releasedOn).toLocaleDateString() : '—'}</div>
            ),
            sortable: true,
            sortValue: (row) => row.releasedOn ?? '',
            width: '85px'
          },
          {
            id: 'actions',
            label: 'Actions',
            headerAlign: 'center',
            accessor: (row) => (
              <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="text-brand-text-dark/70 hover:text-emerald-500 cursor-pointer"
                  aria-label={`Import ${row.name}`}
                  onClick={() => handleInstallPack(row)}
                  disabled={refreshing || installingId === row.name}
                >
                  {installingId === row.name ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                </button>
                <button
                  type="button"
                  className={
                    row.status === 'installed'
                      ? 'hover:text-brand-accent-red cursor-pointer'
                      : 'text-brand-text-dark/50 hover:text-brand-text-dark/60 cursor-default'
                  }
                  aria-label={`Remove ${row.name}`}
                  onClick={() => handleRemovePack(row)}
                  disabled={refreshing || removingId === row.name || row.status !== 'installed'}
                >
                  {removingId === row.name ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ),
            width: '80px'
          }
        ]}
        pageSize={Math.max(1, packs.length)}
        enablePagination={false}
        emptyIcon={showInlineLoading ? Package : Package}
        emptyTitle={showInlineLoading ? 'Loading packs…' : 'No packs found'}
        emptyMessage={
          showInlineLoading
            ? 'Fetching available packs from the configured repository.'
            : 'Pull releases or update the packs repo URL to show available packs.'
        }
        fillContainer
      />
      {error && <p className="text-sm text-brand-accent-red px-3 py-2">{error}</p>}
    </div>
  );
};

export default SettingsPacksTab;
