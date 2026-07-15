import React, { useState, useEffect } from 'react';
import { Modal, Tag, Skeleton, message } from 'antd';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { RiFileCopyLine, RiCheckLine, RiEditLine } from 'react-icons/ri';
import api from '../../../api/axios';

const SnippetViewModal = ({ snippet, spaceId, open, onClose, onEdit }) => {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (!snippet || !open) return;
    setLoading(true);
    api.get(`/api/spaces/${spaceId}/snippets/${snippet._id}/content`)
      .then(r => setCode(r.data.code))
      .catch(() => message.error('Failed to load snippet code'))
      .finally(() => setLoading(false));
  }, [snippet, open, spaceId]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    // Fire usage increment — fire and forget
    api.post(`/api/spaces/${spaceId}/snippets/${snippet._id}/use`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 600 }}>{snippet?.name}</span>
          {snippet?.language && (
            <Tag style={{ fontSize: 11, margin: 0 }}>{snippet.language}</Tag>
          )}
        </div>
      }
      styles={{ body: { padding: 0 } }}
    >
      {/* Caption */}
      {snippet?.caption && (
        <div style={{ padding: '8px 24px', fontSize: 13,
          color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          {snippet.caption}
        </div>
      )}

      {/* Code block */}
      <div style={{ maxHeight: 480, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton active paragraph={{ rows: 8 }} /></div>
        ) : (
          <SyntaxHighlighter
            language={snippet?.language?.toLowerCase() || 'javascript'}
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>

      {/* Footer actions */}
      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{ display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--card2)',
              cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}
          >
            {copied
              ? <><RiCheckLine size={14} /> Copied!</>
              : <><RiFileCopyLine size={14} /> Copy code</>}
          </button>

          {/* Edit button — only shown inside space, not from dashboard widget */}
          {onEdit && (
            <button
              onClick={() => { onClose(); onEdit(snippet) }}
              style={{ display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6,
                border: '1px solid var(--border)', background: 'none',
                cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}
            >
              <RiEditLine size={14} /> Edit
            </button>
          )}
        </div>

        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {code.split('\n').length} lines
        </span>
      </div>
    </Modal>
  );
};

export default SnippetViewModal;
