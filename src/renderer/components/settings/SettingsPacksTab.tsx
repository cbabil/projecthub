import type { BaseMeta, PackMeta } from '@shared/types';
import { Package } from 'lucide-react';
import React, { useMemo } from 'react';

import type { GridColumn } from '../../hooks/useDataGrid.js';
import { type PackRow,usePacksList } from '../../hooks/usePacksList.js';
import Grid from '../Grid.js';
import Search from '../Search.js';
import PackActionsCell from './PackActionsCell.js';
import PacksHeaderBar from './PacksHeaderBar.js';

type Props = {
  repoUrl?: string;
};

const SettingsPacksTab: React.FC<Props> = ({ repoUrl }) => {
  const { packs, refreshing, installingId, removingId, error, refresh, installPack, removePack } = usePacksList(repoUrl);

  const showInlineLoading = refreshing && packs.length === 0 && !error;

  const columns = useMemo(
    (): GridColumn<PackMeta & BaseMeta>[] => [
      { id: 'name', label: 'Name', accessor: (row) => row.name ?? '-', sortable: true, sortValue: (row) => row.name ?? '-', width: '120px' },
      { id: 'description', label: 'Description', accessor: (row) => row.description ?? '-', sortable: true, sortValue: (row) => row.description ?? '-', width: '310px' },
      {
        id: 'installedVersion',
        label: 'Installed',
        accessor: (row) => <div className="w-full text-center">{(row as PackRow).installedVersion ?? '—'}</div>,
        sortable: true,
        sortValue: (row) => (row as PackRow).installedVersion ?? '',
        width: '80px'
      },
      {
        id: 'version',
        label: 'Version',
        accessor: (row) => {
          const packRow = row as PackRow;
          const hasUpdate = packRow.installedVersion && packRow.version && packRow.installedVersion !== packRow.version;
          return <div className={`w-full text-center ${hasUpdate ? 'text-amber-400' : ''}`}>{row.version ?? '-'}</div>;
        },
        sortable: true,
        sortValue: (row) => row.version ?? '-',
        width: '80px'
      },
      {
        id: 'releasedOn',
        label: 'Released On',
        accessor: (row) => {
          const packRow = row as PackRow;
          return <div className="w-full text-center">{packRow.releasedOn ? new Date(packRow.releasedOn).toLocaleDateString() : '—'}</div>;
        },
        sortable: true,
        sortValue: (row) => (row as PackRow).releasedOn ?? '',
        width: '85px'
      },
      {
        id: 'actions',
        label: 'Actions',
        headerAlign: 'center',
        accessor: (row) => (
          <PackActionsCell
            pack={row as PackRow}
            refreshing={refreshing}
            installingId={installingId}
            removingId={removingId}
            onInstall={installPack}
            onRemove={removePack}
          />
        ),
        width: '80px'
      }
    ],
    [refreshing, installingId, removingId, installPack, removePack]
  );

  const gridItems = useMemo(
    () =>
      packs.map(
        (p) =>
          ({
            ...p,
            type: 'project',
            lastEdited: p.releasedOn ?? '',
            description: p.description ?? p.summary ?? '-',
            version: p.version ?? '-'
          } as PackMeta & BaseMeta)
      ),
    [packs]
  );

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 overflow-hidden">
      <PacksHeaderBar refreshing={refreshing} onRefresh={refresh} />
      <Search value="" onChange={() => {}} placeholder="Search packs" className="mb-3" />
      <Grid
        items={gridItems}
        columns={columns}
        pageSize={Math.max(1, packs.length)}
        enablePagination={false}
        emptyIcon={Package}
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
