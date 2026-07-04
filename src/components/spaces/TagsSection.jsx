import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Button, Popconfirm, Skeleton, Tag, message } from 'antd';
import { RiPriceTag3Line, RiEditLine, RiDeleteBinLine, RiArrowRightUpLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function TagsSection({ space, isLight }) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [tagToRename, setTagToRename] = useState('');
  const [newTagName, setNewTagName] = useState('');

  const handleDocOpen = async (doc) => {
    if (doc.type === 'url') {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
    } else if (doc.type === 'pdf') {
      try {
        const { data } = await api.get(`/api/spaces/${space._id}/docs/${doc._id}/signed-url`);
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } catch (err) {
        message.error('Failed to retrieve file URL');
      }
    } else {
      setSearchParams({ section: 'docs', id: doc._id });
    }
  };

  // Fetch unique tags in space
  const { data: tagData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags', space._id],
    queryFn: async () => {
      const { data } = await api.get(`/api/spaces/${space._id}/tags`);
      return data.tags || [];
    }
  });

  const tags = tagData || [];

  // Fetch tag content matching selected tag
  const { data: tagContent, isLoading: contentLoading } = useQuery({
    queryKey: ['tagContent', space._id, selectedTag],
    queryFn: async () => {
      if (!selectedTag) return null;
      const { data } = await api.get(`/api/spaces/${space._id}/tags/${encodeURIComponent(selectedTag)}/content`);
      return data;
    },
    enabled: !!selectedTag
  });

  // Rename tag mutation
  const renameMutation = useMutation({
    mutationFn: async ({ oldTag, newTag }) => {
      return api.patch(`/api/spaces/${space._id}/tags/rename`, { oldTag, newTag });
    },
    onSuccess: () => {
      message.success('Tag renamed successfully');
      queryClient.invalidateQueries(['tags', space._id]);
      if (selectedTag === tagToRename) {
        setSelectedTag(newTagName.trim().toLowerCase());
      }
      setRenameModalOpen(false);
      setNewTagName('');
    },
    onError: (err) => {
      message.error(err.response?.data?.error || 'Failed to rename tag');
    }
  });

  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: async (tag) => {
      return api.delete(`/api/spaces/${space._id}/tags/${encodeURIComponent(tag)}`);
    },
    onSuccess: () => {
      message.success('Tag deleted from all resources');
      queryClient.invalidateQueries(['tags', space._id]);
      if (selectedTag === tagToRename) setSelectedTag(null);
    }
  });

  const handleRenameSubmit = () => {
    if (!newTagName.trim()) {
      message.error('New tag name is required');
      return;
    }
    renameMutation.mutate({ oldTag: tagToRename, newTag: newTagName });
  };

  // Font sizing parameters for tag cloud
  const minFont = 12;
  const maxFont = 26;
  const counts = tags.map(t => t.count);
  const minCount = counts.length > 0 ? Math.min(...counts) : 0;
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;

  return (
    <div style={{ padding: '20px' }}>
      
      {/* Tag Cloud Panel */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', marginBottom: '14px', fontWeight: 600 }}>
          Tag Cloud
        </h4>
        {tagsLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : tags.length === 0 ? (
          <div style={{ color: '#666', fontSize: '13px' }}>
            No tags found. Tags appear automatically as you add tags to docs, notes, snippets, repos, prompts, and communities.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            {tags.map((t) => {
              const isActive = selectedTag === t.tag;
              const fontSize = minCount === maxCount ? 14 : minFont + ((t.count - minCount) / (maxCount - minCount)) * (maxFont - minFont);
              return (
                <div
                  key={t.tag}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
                    background: isActive ? (isLight ? 'rgba(79,70,229,0.08)' : 'rgba(99,102,241,0.12)') : (isLight ? '#f3f4f6' : '#222'),
                    border: `1px solid ${isActive ? (isLight ? '#4f46e5' : '#6366f1') : (isLight ? '#e5e7eb' : '#333')}`,
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setSelectedTag(isActive ? null : t.tag)}
                >
                  <span style={{
                    fontSize: `${fontSize}px`, fontWeight: isActive ? 600 : 500,
                    color: isActive ? (isLight ? '#4f46e5' : '#6366f1') : (isLight ? '#111' : '#fff')
                  }}>
                    #{t.tag}
                  </span>
                  <span style={{ fontSize: '10px', color: '#666', fontWeight: 600 }}>
                    ({t.count})
                  </span>

                  {/* Rename / Delete buttons only on active tag */}
                  {isActive && (
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setTagToRename(t.tag); setNewTagName(t.tag); setRenameModalOpen(true); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', padding: '2px' }}
                      >
                        <RiEditLine size={12} />
                      </button>
                      <Popconfirm
                        title="Remove tag from all resources?"
                        onConfirm={() => deleteMutation.mutate(t.tag)}
                        okText="Delete"
                        cancelText="Cancel"
                      >
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', padding: '2px' }}>
                          <RiDeleteBinLine size={12} />
                        </button>
                      </Popconfirm>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Tag Content Listing */}
      {selectedTag && (
        <div style={{ borderTop: `1px solid ${isLight ? '#ebebeb' : '#2a2a2a'}`, paddingTop: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: isLight ? '#111' : '#fff', marginBottom: '16px' }}>
            Tagged Resources: <span style={{ color: isLight ? '#4f46e5' : '#6366f1' }}>#{selectedTag}</span>
          </h3>

          {contentLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : tagContent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Docs Grid */}
              {tagContent.docs?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: 600 }}>DOCUMENTS</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                    {tagContent.docs.map(d => (
                      <div key={d._id} onClick={() => handleDocOpen(d)} style={{ cursor: 'pointer', padding: '10px', background: isLight ? '#f9f9fc' : '#141414', border: `1px solid ${isLight ? '#ebebeb' : '#282828'}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#111' : '#fff' }}>{d.title}</p>
                          <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>{d.type}</span>
                        </div>
                        <span style={{ color: isLight ? '#4f46e5' : '#6366f1' }}><RiArrowRightUpLine size={16} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Grid */}
              {tagContent.notes?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: 600 }}>NOTES</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                    {tagContent.notes.map(n => (
                      <div key={n._id} onClick={() => setSearchParams({ section: 'notes', noteId: n._id })} style={{ cursor: 'pointer', padding: '10px', background: isLight ? '#f9f9fc' : '#141414', border: `1px solid ${isLight ? '#ebebeb' : '#282828'}`, borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: isLight ? '#111' : '#fff' }}>{n.title}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Snippets Grid */}
              {tagContent.snippets?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: 600 }}>CODE SNIPPETS</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                    {tagContent.snippets.map(s => (
                      <div key={s._id} onClick={() => setSearchParams({ section: 'snippets', id: s._id })} style={{ cursor: 'pointer', padding: '10px', background: isLight ? '#f9f9fc' : '#141414', border: `1px solid ${isLight ? '#ebebeb' : '#282828'}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#111' : '#fff' }}>{s.name}</p>
                          <span style={{ fontSize: '10px', color: '#666' }}>{s.language}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Repos Grid */}
              {tagContent.repos?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: 600 }}>REPOSITORIES</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                    {tagContent.repos.map(r => (
                      <div key={r._id} onClick={() => window.open(r.url, '_blank', 'noopener,noreferrer')} style={{ cursor: 'pointer', padding: '10px', background: isLight ? '#f9f9fc' : '#141414', border: `1px solid ${isLight ? '#ebebeb' : '#282828'}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#4f46e5' : '#6366f1' }}>{r.name}</span>
                          <span style={{ fontSize: '10px', color: '#666', display: 'block', textTransform: 'uppercase' }}>{r.platform}</span>
                        </div>
                        <span style={{ color: isLight ? '#4f46e5' : '#6366f1' }}><RiArrowRightUpLine size={16} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompts Grid */}
              {tagContent.prompts?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: 600 }}>SAVED PROMPTS</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                    {tagContent.prompts.map(p => (
                      <div key={p._id} onClick={() => setSearchParams({ section: 'prompts', id: p._id })} style={{ cursor: 'pointer', padding: '10px', background: isLight ? '#f9f9fc' : '#141414', border: `1px solid ${isLight ? '#ebebeb' : '#282828'}`, borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: isLight ? '#111' : '#fff' }}>{p.title}</p>
                        <span style={{ fontSize: '10px', color: '#666' }}>Model: {p.model || 'Unknown'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communities Grid */}
              {tagContent.communities?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: 600 }}>COMMUNITIES</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                    {tagContent.communities.map(c => (
                      <div key={c._id} onClick={() => window.open(c.url, '_blank', 'noopener,noreferrer')} style={{ cursor: 'pointer', padding: '10px', background: isLight ? '#f9f9fc' : '#141414', border: `1px solid ${isLight ? '#ebebeb' : '#282828'}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: isLight ? '#4f46e5' : '#6366f1' }}>{c.name}</span>
                          <span style={{ fontSize: '10px', color: '#666', display: 'block', textTransform: 'uppercase' }}>{c.platform}</span>
                        </div>
                        <span style={{ color: isLight ? '#4f46e5' : '#6366f1' }}><RiArrowRightUpLine size={16} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>
      )}

      {/* Rename Tag Modal */}
      <Modal
        title="Rename Tag"
        open={renameModalOpen}
        onCancel={() => setRenameModalOpen(false)}
        onOk={handleRenameSubmit}
        okText="Rename Tag"
        cancelText="Cancel"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>CURRENT TAG NAME</label>
            <Input value={tagToRename} readOnly disabled />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>NEW TAG NAME</label>
            <Input placeholder="Enter new tag name..." value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
          </div>
        </div>
      </Modal>

    </div>
  );
}
