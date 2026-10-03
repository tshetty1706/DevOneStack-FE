import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, Tag } from 'antd';
import { RiFolderLine, RiFolderOpenLine, RiSearchLine } from 'react-icons/ri';
import api from '../../api/axios';

/**
 * Reusable "Save in" / "Move to" Folder Picker component.
 * Allows searching, browsing, and selecting any folder within the space up to 4 levels.
 */
export default function FolderPicker({
  spaceId,
  value,
  onChange,
  isLight = false,
  placeholder = 'Select destination folder...',
  style = {},
  allowRoot = true,
  disabled = false,
  excludeIds = [],
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all folders for the space
  const { data: folderData, isLoading } = useQuery({
    queryKey: ['folders', spaceId],
    queryFn: async () => {
      const res = await api.get(`/api/spaces/${spaceId}/folders`);
      return res.data.folders || [];
    },
    enabled: !!spaceId,
    staleTime: 30000,
  });

  const rawFolders = folderData || [];
  const excludedSet = useMemo(() => new Set(excludeIds.map(String)), [excludeIds]);
  const folders = useMemo(() => rawFolders.filter(f => !excludedSet.has(String(f._id))), [rawFolders, excludedSet]);

  // Build options list with visual path and depth hierarchy
  const options = useMemo(() => {
    const list = [];

    if (allowRoot) {
      list.push({
        value: 'root',
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
            <RiFolderLine size={15} style={{ color: isLight ? '#4f46e5' : '#818cf8', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Space Root</span>
            <Tag color="blue" style={{ fontSize: '10px', marginLeft: 'auto', padding: '0 4px', lineHeight: '16px' }}>
              Root
            </Tag>
          </div>
        ),
        searchLabel: 'Space Root (Top Level)',
        depth: 0,
      });
    }

    folders.forEach(f => {
      const depth = f.depth || (f.pathArray ? f.pathArray.length : 1);
      const displayPath = f.path || f.name;

      list.push({
        value: f._id,
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0', minWidth: 0 }}>
            <RiFolderOpenLine size={15} style={{ color: isLight ? '#4f46e5' : '#818cf8', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayPath}
            </span>
            <Tag
              color={depth === 4 ? 'orange' : depth >= 3 ? 'cyan' : 'default'}
              style={{ fontSize: '10px', marginLeft: 'auto', padding: '0 4px', lineHeight: '16px', flexShrink: 0 }}
            >
              Lvl {depth}
            </Tag>
          </div>
        ),
        searchLabel: `${f.name} ${displayPath}`,
        depth,
      });
    });

    return list;
  }, [folders, allowRoot, isLight]);

  // Selected folder path preview
  const selectedFolder = useMemo(() => {
    if (!value || value === 'root' || value === 'null') {
      return { name: 'Space Root', path: 'Space Root' };
    }
    return folders.find(f => f._id === value) || { name: 'Space Root', path: 'Space Root' };
  }, [folders, value]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      <Select
        showSearch
        disabled={disabled}
        loading={isLoading}
        value={value || (allowRoot ? 'root' : undefined)}
        onChange={(val) => {
          const finalVal = (val === 'root' || val === 'null') ? null : val;
          onChange(finalVal);
        }}
        placeholder={placeholder}
        filterOption={(input, option) =>
          (option?.searchLabel || '').toLowerCase().includes(input.toLowerCase().trim())
        }
        options={options}
        style={{ width: '100%', minHeight: '38px' }}
      />
      {selectedFolder && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted, #888)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Path:</span>
          <code style={{ fontSize: '11px', padding: '1px 5px', borderRadius: '4px', background: isLight ? '#f3f4f6' : 'rgba(255,255,255,0.06)' }}>
            {selectedFolder.path || selectedFolder.name || 'Space Root'}
          </code>
        </span>
      )}
    </div>
  );
}
