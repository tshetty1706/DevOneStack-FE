/**
 * QuickAddModals.jsx
 * Single canonical definition for all 6 space content creation/editing modals.
 * Shared between SpaceDashboard (Quick Add overview) and individual section components.
 */
import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Upload, Switch, message } from 'antd';
import {
  RiUploadCloudLine,
  RiLightbulbLine, RiBugLine, RiErrorWarningLine,
  RiCheckboxCircleLine, RiQuestionLine, RiSparklingLine
} from 'react-icons/ri';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import FolderPicker from './FolderPicker';

const { Dragger } = Upload;

// ─── Shared configuration options ─────────────────────────────────────────────
const LEARNING_TYPES = {
  learning:      { label: 'Learning',      icon: RiLightbulbLine,       color: '#eab308' },
  fix:           { label: 'Fix',           icon: RiBugLine,             color: '#f87171' },
  gotcha:        { label: 'Gotcha',        icon: RiErrorWarningLine,    color: '#f97316' },
  'best-practice':{ label: 'Best Practice', icon: RiCheckboxCircleLine, color: '#10b981' },
  question:      { label: 'Question',      icon: RiQuestionLine,        color: '#0ea5e9' },
  idea:          { label: 'Idea',          icon: RiSparklingLine,       color: '#a855f7' },
};

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx',        label: 'React JSX' },
  { value: 'tsx',        label: 'React TSX' },
  { value: 'python',     label: 'Python' },
  { value: 'css',        label: 'CSS' },
  { value: 'html',       label: 'HTML' },
  { value: 'sql',        label: 'SQL' },
  { value: 'bash',       label: 'Bash/Shell' },
  { value: 'json',       label: 'JSON' },
  { value: 'go',         label: 'Go' },
  { value: 'rust',       label: 'Rust' },
  { value: 'other',      label: 'Other' },
];

const REPO_PLATFORMS = [
  { value: 'github',    label: 'GitHub' },
  { value: 'gitlab',    label: 'GitLab' },
  { value: 'bitbucket', label: 'BitBucket' },
  { value: 'other',     label: 'Other' },
];

const AI_MODELS = [
  { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'Claude 3.5 Haiku',  label: 'Claude 3.5 Haiku' },
  { value: 'Claude 3 Opus',     label: 'Claude 3 Opus' },
  { value: 'GPT-4o',            label: 'GPT-4o' },
  { value: 'GPT-4o mini',       label: 'GPT-4o mini' },
  { value: 'o1',                label: 'OpenAI o1' },
  { value: 'o1-mini',           label: 'OpenAI o1-mini' },
  { value: 'GPT-4 Turbo',       label: 'GPT-4 Turbo' },
  { value: 'Gemini 2.0 Flash',  label: 'Gemini 2.0 Flash' },
  { value: 'Gemini 1.5 Pro',    label: 'Gemini 1.5 Pro' },
  { value: 'Gemini 1.5 Flash',  label: 'Gemini 1.5 Flash' },
  { value: 'DeepSeek R1',       label: 'DeepSeek R1' },
  { value: 'DeepSeek V3',       label: 'DeepSeek V3' },
  { value: 'Llama 3.3 70B',     label: 'Llama 3.3 (70B)' },
  { value: 'Llama 3.1',         label: 'Llama 3.1' },
  { value: 'Mistral Large',     label: 'Mistral Large' },
  { value: 'Qwen 2.5',          label: 'Qwen 2.5' },
  { value: 'Custom',            label: 'Custom Model' },
];

const COMMUNITY_PLATFORMS = [
  { value: 'discord',    label: 'Discord Server' },
  { value: 'reddit',     label: 'Reddit Sub' },
  { value: 'slack',      label: 'Slack Workspace' },
  { value: 'twitter',    label: 'Twitter / X Community' },
  { value: 'newsletter', label: 'Newsletter / Blog' },
  { value: 'youtube',    label: 'YouTube Channel' },
  { value: 'github',     label: 'GitHub Discussions' },
  { value: 'other',      label: 'Other / Website' },
];

const labelStyle = { fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: 600 };

const modalBodyStyles = {
  content: {
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  body: {
    maxHeight: 'calc(90vh - 120px)',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    padding: '16px 20px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--accent-color, #6366f1) transparent',
  },
  mask: { backdropFilter: 'blur(4px)' },
};

// ─── 1. LEARNING MODAL ────────────────────────────────────────────────────────
export function QuickAddLearningModal({ open, onClose, space, editingLearning = null, defaultFolderId = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [title, setTitle]               = useState('');
  const [type, setType]                 = useState('learning');
  const [content, setContent]           = useState('');
  const [folderId, setFolderId]         = useState(defaultFolderId);
  const [tags, setTags]                 = useState([]);
  const [hasCode, setHasCode]           = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeContent, setCodeContent]   = useState('');

  useEffect(() => {
    if (open) {
      if (editingLearning) {
        setTitle(editingLearning.title || '');
        setType(editingLearning.type || 'learning');
        setContent(editingLearning.content || '');
        setFolderId(editingLearning.folderId || defaultFolderId || null);
        setTags(editingLearning.tags || []);
        setHasCode(!!editingLearning.codeExample?.code);
        setCodeLanguage(editingLearning.codeExample?.language || 'javascript');
        setCodeContent(editingLearning.codeExample?.code || '');
      } else {
        setTitle('');
        setType('learning');
        setContent('');
        setFolderId(defaultFolderId || null);
        setTags([]);
        setHasCode(false);
        setCodeLanguage('javascript');
        setCodeContent('');
      }
    }
  }, [open, editingLearning, defaultFolderId]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editingLearning) {
        return api.patch(`/api/spaces/${space._id}/items/${editingLearning._id}`, payload);
      }
      return api.post(`/api/spaces/${space._id}/items`, { ...payload, type: 'learning' });
    },
    onSuccess: (res) => {
      message.success(editingLearning ? 'Learning updated!' : 'Learning logged!');
      queryClient.invalidateQueries(['items', space._id, 'learning']);
      queryClient.invalidateQueries(['items', space._id, 'all']);
      queryClient.invalidateQueries(['learnings', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['history', space._id]);
      onSuccess?.(res.data?.item || res.data?.learning);
      onClose();
    },
    onError: (err) => message.error(err.response?.data?.error || 'Failed to save'),
  });

  const handleOk = () => {
    if (!title.trim() || !content.trim()) {
      message.error('Title and content are required');
      return;
    }
    mutation.mutate({
      title: title.trim(),
      learningType: type,
      content: content.trim(),
      folderId: folderId || null,
      tags,
      codeExample: hasCode ? { language: codeLanguage, code: codeContent } : { language: '', code: '' }
    });
  };

  return (
    <Modal
      title={editingLearning ? 'Edit Developer Learning' : 'Log New Developer Knowledge'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={editingLearning ? 'Update Entry' : 'Log Entry'}
      cancelText="Cancel"
      confirmLoading={mutation.isPending}
      width={580}
      style={{ top: 30 }}
      styles={modalBodyStyles}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
        <div>
          <label style={labelStyle}>SAVE IN</label>
          <FolderPicker
            spaceId={space?._id}
            value={folderId}
            onChange={setFolderId}
            allowRoot={true}
          />
        </div>
        <div>
          <label style={labelStyle}>PURPOSE / TYPE</label>
          <Select
            value={type}
            onChange={setType}
            style={{ width: '100%' }}
            options={Object.entries(LEARNING_TYPES).map(([k, v]) => {
              const Icon = v.icon;
              return {
                value: k,
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={13} style={{ color: v.color }} />
                    <span style={{ fontSize: '13px' }}>{v.label}</span>
                  </div>
                )
              };
            })}
          />
        </div>
        <div>
          <label style={labelStyle}>TITLE</label>
          <Input placeholder="e.g. Why useEffect cleanup matters" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>WHAT DID YOU LEARN?</label>
          <Input.TextArea
            placeholder="Explanation of the concept, fix details, gotcha warning, or best practices you discovered..."
            value={content} onChange={e => setContent(e.target.value)}
            rows={5}
            style={{ fontSize: '13px', lineHeight: 1.5 }}
          />
        </div>
        <div>
          <label style={labelStyle}>TAGS</label>
          <Select mode="tags" style={{ width: '100%' }} placeholder="Add tag keywords..." value={tags} onChange={setTags} />
        </div>
        <div style={{ borderTop: '1px solid var(--card-border, #2a2a2a)', paddingTop: '12px' }}>
          <Button type={hasCode ? 'primary' : 'default'} danger={hasCode} onClick={() => setHasCode(!hasCode)} size="small" style={{ fontSize: '11px', fontWeight: 600 }}>
            {hasCode ? 'Remove Code Example' : '+ Add Code Example'}
          </Button>
        </div>
        {hasCode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-color, #111)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border, #2a2a2a)' }}>
            <div>
              <label style={labelStyle}>CODE LANGUAGE</label>
              <Select options={CODE_LANGUAGES} style={{ width: '150px' }} value={codeLanguage} onChange={setCodeLanguage} />
            </div>
            <div>
              <label style={labelStyle}>CODE BLOCK</label>
              <Input.TextArea
                placeholder="// Illustrate with a code example..."
                value={codeContent} onChange={e => setCodeContent(e.target.value)}
                rows={8}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── 2. SNIPPET MODAL ────────────────────────────────────────────────────────
export function QuickAddSnippetModal({ open, onClose, space, editingSnippet = null, defaultFolderId = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [name, setName]         = useState('');
  const [caption, setCaption]   = useState('');
  const [folderId, setFolderId] = useState(defaultFolderId);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode]         = useState('');
  const [tags, setTags]         = useState([]);

  useEffect(() => {
    if (open) {
      if (editingSnippet) {
        setName(editingSnippet.name || '');
        setCaption(editingSnippet.caption || '');
        setFolderId(editingSnippet.folderId || defaultFolderId || null);
        setLanguage(editingSnippet.language || 'javascript');
        setCode(editingSnippet.code || '');
        setTags(editingSnippet.tags || []);
      } else {
        setName('');
        setCaption('');
        setFolderId(defaultFolderId || null);
        setLanguage('javascript');
        setCode('');
        setTags([]);
      }
    }
  }, [open, editingSnippet, defaultFolderId]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editingSnippet) {
        return api.patch(`/api/spaces/${space._id}/items/${editingSnippet._id}`, payload);
      }
      return api.post(`/api/spaces/${space._id}/items`, { ...payload, type: 'snippet' });
    },
    onSuccess: (res) => {
      message.success(editingSnippet ? 'Snippet updated!' : 'Snippet created!');
      queryClient.invalidateQueries(['items', space._id, 'snippet']);
      queryClient.invalidateQueries(['items', space._id, 'all']);
      queryClient.invalidateQueries(['snippets', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['history', space._id]);
      onSuccess?.(res.data?.item || res.data?.snippet);
      onClose();
    },
    onError: (err) => message.error(err.response?.data?.error || 'Failed to save snippet'),
  });

  const handleOk = () => {
    if (!name || !code) { message.error('Name and Code are required'); return; }
    mutation.mutate({
      title: name.trim(),
      caption: caption?.trim() || '',
      folderId: folderId || null,
      language: language.trim(),
      content: code,
      tags
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.target.selectionStart, en = e.target.selectionEnd;
      const v = code.substring(0, s) + '  ' + code.substring(en);
      setCode(v);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
    }
  };

  return (
    <Modal
      title={editingSnippet ? 'Edit Code Snippet' : 'Save New Boilerplate/Snippet'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={editingSnippet ? 'Update Snippet' : 'Save Snippet'}
      cancelText="Cancel"
      confirmLoading={mutation.isPending}
      width={600}
      style={{ top: 30 }}
      styles={modalBodyStyles}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
        <div>
          <label style={labelStyle}>SAVE IN</label>
          <FolderPicker
            spaceId={space?._id}
            value={folderId}
            onChange={setFolderId}
            allowRoot={true}
          />
        </div>
        <div>
          <label style={labelStyle}>SNIPPET NAME</label>
          <Input placeholder="e.g. Express Server Middleware Setup" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>CAPTION / DESCRIPTION</label>
          <Input placeholder="Brief explanation of when to use this snippet..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={200} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>LANGUAGE</label>
            <Select options={CODE_LANGUAGES} style={{ width: '100%' }} value={language} onChange={setLanguage} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>TAGS</label>
            <Select mode="tags" style={{ width: '100%' }} placeholder="Tags..." value={tags} onChange={setTags} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>CODE BLOCK</label>
          <Input.TextArea
            placeholder="// Paste your code here..."
            value={code} onChange={e => setCode(e.target.value)} onKeyDown={handleKeyDown}
            rows={12}
            style={{ fontFamily: 'monospace', fontSize: '13px', height: 240, resize: 'vertical', maxHeight: 400, overflowY: 'auto' }}
          />
          <span style={{ fontSize: '11px', color: '#666', marginTop: '4px', display: 'block' }}>Tip: Press Tab to insert 2 spaces indent.</span>
        </div>
      </div>
    </Modal>
  );
}

// ─── 3. DOC MODAL ────────────────────────────────────────────────────────────
export function QuickAddDocModal({ open, onClose, space, defaultFolderId = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('url');
  const [title, setTitle]         = useState('');
  const [url, setUrl]             = useState('');
  const [caption, setCaption]     = useState('');
  const [folderId, setFolderId]   = useState(defaultFolderId);
  const [tags, setTags]           = useState([]);
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab('url');
      setTitle('');
      setUrl('');
      setCaption('');
      setFolderId(defaultFolderId || null);
      setTags([]);
      setFile(null);
      setLoading(false);
    }
  }, [open, defaultFolderId]);

  const addUrlMutation = useMutation({
    mutationFn: (payload) => api.post(`/api/spaces/${space._id}/items`, {
      type: 'doc',
      docType: 'url',
      title: payload.title,
      url: payload.url,
      caption: payload.caption,
      folderId: payload.folderId || null,
      tags: payload.tags
    }),
    onSuccess: () => {
      message.success('Document link added!');
      queryClient.invalidateQueries(['items', space._id, 'doc']);
      queryClient.invalidateQueries(['items', space._id, 'all']);
      queryClient.invalidateQueries(['docs', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['history', space._id]);
      onSuccess?.();
      onClose();
    },
    onError: (err) => message.error(err.response?.data?.error || 'Failed to add document'),
  });

  const handleUpload = async () => {
    if (!file) { message.error('Please select a file to upload'); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('caption', caption);
    if (folderId && folderId !== 'root' && folderId !== 'null') formData.append('folderId', folderId);
    formData.append('tags', JSON.stringify(tags));
    try {
      await api.post(`/api/spaces/${space._id}/items/upload`, formData);
      message.success('File uploaded successfully!');
      queryClient.invalidateQueries(['items', space._id, 'doc']);
      queryClient.invalidateQueries(['items', space._id, 'all']);
      queryClient.invalidateQueries(['docs', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['history', space._id]);
      onSuccess?.();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.error || 'Upload failed');
    } finally { setLoading(false); }
  };

  const handleOk = () => {
    if (activeTab === 'url') {
      if (!title || !url) { message.error('Title and URL are required'); return; }
      addUrlMutation.mutate({ title, url, caption, folderId, tags });
    } else { handleUpload(); }
  };

  return (
    <Modal
      title="Add New Reference Document"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading || addUrlMutation.isPending}
      okText="Add Document"
      cancelText="Cancel"
      width={560}
      style={{ top: 30 }}
      styles={modalBodyStyles}
    >
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--card-border, #2a2a2a)', paddingBottom: '12px', marginBottom: '16px', marginTop: '8px' }}>
        {[{ id: 'url', label: 'External URL' }, { id: 'pdf', label: 'PDF Document' }, { id: 'image', label: 'Image/Diagram' }].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setFile(null); }}
            style={{
              padding: '6px 12px', borderRadius: '6px', border: 'none',
              background: activeTab === tab.id ? 'var(--accent-color, #6366f1)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#888',
              fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>SAVE IN</label>
          <FolderPicker
            spaceId={space?._id}
            value={folderId}
            onChange={setFolderId}
            allowRoot={true}
          />
        </div>
        {activeTab === 'url' ? (
          <>
            <div>
              <label style={labelStyle}>DOCUMENT TITLE</label>
              <Input placeholder="e.g. React Official Getting Started Guide" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>EXTERNAL URL</label>
              <Input placeholder="https://react.dev/learn" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={labelStyle}>UPLOAD FILE</label>
              <Dragger
                accept={activeTab === 'pdf' ? '.pdf' : 'image/*'}
                beforeUpload={(f) => {
                  if (f.size > 10 * 1024 * 1024) { message.error('File size must be less than 10MB'); return Upload.LIST_IGNORE; }
                  setFile(f); return false;
                }}
                maxCount={1} onRemove={() => setFile(null)}
              >
                <div style={{ padding: '16px 0' }}>
                  <RiUploadCloudLine size={32} style={{ color: '#888', marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>Click or drag file here to upload</p>
                  <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0' }}>PDF or Images up to 10MB</p>
                </div>
              </Dragger>
              {file && <span style={{ fontSize: '12px', color: '#22c55e', display: 'block', marginTop: '6px' }}>Selected: {file.name}</span>}
            </div>
            <div>
              <label style={labelStyle}>DOCUMENT TITLE</label>
              <Input placeholder="e.g. Architecture Diagram (Optional)" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </>
        )}
        <div>
          <label style={labelStyle}>CAPTION / DESCRIPTION</label>
          <Input.TextArea placeholder="Brief description of the resource..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={300} rows={3} />
        </div>
        <div>
          <label style={labelStyle}>TAGS</label>
          <Select mode="tags" style={{ width: '100%' }} placeholder="Type tags and hit enter" value={tags} onChange={setTags} />
        </div>
      </div>
    </Modal>
  );
}

// ─── 4. REPO MODAL ───────────────────────────────────────────────────────────
export function QuickAddRepoModal({ open, onClose, space, editingRepo = null, defaultFolderId = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [name, setName]         = useState('');
  const [url, setUrl]            = useState('');
  const [caption, setCaption]    = useState('');
  const [folderId, setFolderId]  = useState(defaultFolderId);
  const [platform, setPlatform]  = useState('github');
  const [tags, setTags]          = useState([]);
  const [isOwn, setIsOwn]        = useState(false);

  useEffect(() => {
    if (open) {
      if (editingRepo) {
        setName(editingRepo.name || '');
        setUrl(editingRepo.url || '');
        setCaption(editingRepo.caption || '');
        setFolderId(editingRepo.folderId || defaultFolderId || null);
        setPlatform(editingRepo.platform || 'github');
        setTags(editingRepo.tags || []);
        setIsOwn(!!editingRepo.isOwn);
      } else {
        setName('');
        setUrl('');
        setCaption('');
        setFolderId(defaultFolderId || null);
        setPlatform('github');
        setTags([]);
        setIsOwn(false);
      }
    }
  }, [open, editingRepo, defaultFolderId]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editingRepo) {
        return api.patch(`/api/spaces/${space._id}/items/${editingRepo._id}`, payload);
      }
      return api.post(`/api/spaces/${space._id}/items`, { ...payload, type: 'repo' });
    },
    onSuccess: (res) => {
      message.success(editingRepo ? 'Repository updated!' : 'Repository linked!');
      queryClient.invalidateQueries(['items', space._id, 'repo']);
      queryClient.invalidateQueries(['items', space._id, 'all']);
      queryClient.invalidateQueries(['repos', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['history', space._id]);
      onSuccess?.(res.data?.item || res.data?.repo);
      onClose();
    },
    onError: (err) => message.error(err.response?.data?.error || 'Failed to link repository'),
  });

  const detectPlatformAndName = (inputUrl) => {
    if (!inputUrl) return;
    let detected = 'other';
    if (inputUrl.includes('github.com')) detected = 'github';
    else if (inputUrl.includes('gitlab.com')) detected = 'gitlab';
    else if (inputUrl.includes('bitbucket.org')) detected = 'bitbucket';
    setPlatform(detected);
    if (!name) {
      try {
        const p = new URL(inputUrl).pathname.split('/').filter(Boolean);
        if (p.length >= 2) setName(p[1]);
        else if (p.length === 1) setName(p[0]);
      } catch {}
    }
  };

  const handleOk = () => {
    if (!name || !url) { message.error('Name and URL are required'); return; }
    mutation.mutate({
      title: name.trim(),
      url: url.trim(),
      caption: caption?.trim() || '',
      folderId: folderId || null,
      platform,
      tags,
      isOwn
    });
  };

  return (
    <Modal
      title={editingRepo ? 'Edit Repository Connection' : 'Link New Repository'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={editingRepo ? 'Update Repository' : 'Link Repository'}
      cancelText="Cancel"
      confirmLoading={mutation.isPending}
      width={520}
      style={{ top: 30 }}
      styles={modalBodyStyles}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
        <div>
          <label style={labelStyle}>SAVE IN</label>
          <FolderPicker
            spaceId={space?._id}
            value={folderId}
            onChange={setFolderId}
            allowRoot={true}
          />
        </div>
        <div>
          <label style={labelStyle}>REPOSITORY URL</label>
          <Input placeholder="e.g. https://github.com/facebook/react" value={url} onChange={e => setUrl(e.target.value)} onBlur={() => detectPlatformAndName(url)} />
        </div>
        <div>
          <label style={labelStyle}>DISPLAY NAME</label>
          <Input placeholder="e.g. react" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>CAPTION / DESCRIPTION</label>
          <Input placeholder="Short project summary..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={200} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>PLATFORM</label>
            <Select options={REPO_PLATFORMS} style={{ width: '100%' }} value={platform} onChange={setPlatform} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>TAGS</label>
            <Select mode="tags" style={{ width: '100%' }} placeholder="Tags..." value={tags} onChange={setTags} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <Switch checked={isOwn} onChange={setIsOwn} />
          <span style={{ fontSize: '13px', color: 'var(--text-color)' }}>I am the owner/maintainer of this project</span>
        </div>
      </div>
    </Modal>
  );
}

// ─── 5. PROMPT MODAL ─────────────────────────────────────────────────────────
export function QuickAddPromptModal({ open, onClose, space, editingPrompt = null, defaultFolderId = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [title, setTitle]             = useState('');
  const [body, setBody]               = useState('');
  const [caption, setCaption]         = useState('');
  const [folderId, setFolderId]       = useState(defaultFolderId);
  const [model, setModel]             = useState('Claude 3.5 Sonnet');
  const [customModel, setCustomModel] = useState('');
  const [tags, setTags]               = useState([]);

  useEffect(() => {
    if (open) {
      if (editingPrompt) {
        setTitle(editingPrompt.title || '');
        setBody(editingPrompt.body || editingPrompt.content || '');
        setCaption(editingPrompt.caption || '');
        setFolderId(editingPrompt.folderId || defaultFolderId || null);
        const isStandard = AI_MODELS.some(m => m.value === editingPrompt.model);
        if (isStandard) {
          setModel(editingPrompt.model);
          setCustomModel('');
        } else {
          setModel('Custom');
          setCustomModel(editingPrompt.model || '');
        }
        setTags(editingPrompt.tags || []);
      } else {
        setTitle('');
        setBody('');
        setCaption('');
        setFolderId(defaultFolderId || null);
        setModel('Claude 3.5 Sonnet');
        setCustomModel('');
        setTags([]);
      }
    }
  }, [open, editingPrompt, defaultFolderId]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editingPrompt) {
        return api.patch(`/api/spaces/${space._id}/items/${editingPrompt._id}`, payload);
      }
      return api.post(`/api/spaces/${space._id}/items`, { ...payload, type: 'prompt' });
    },
    onSuccess: (res) => {
      message.success(editingPrompt ? 'Prompt updated!' : 'AI Prompt saved!');
      queryClient.invalidateQueries(['items', space._id, 'prompt']);
      queryClient.invalidateQueries(['items', space._id, 'all']);
      queryClient.invalidateQueries(['prompts', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['history', space._id]);
      onSuccess?.(res.data?.item || res.data?.prompt);
      onClose();
    },
    onError: (err) => message.error(err.response?.data?.error || 'Failed to save prompt'),
  });

  const handleOk = () => {
    if (!title || !body) { message.error('Title and Prompt Body are required'); return; }
    const finalModel = model === 'Custom' ? customModel : model;
    mutation.mutate({
      title: title.trim(),
      content: body.trim(),
      caption: caption?.trim() || '',
      folderId: folderId || null,
      model: finalModel,
      tags
    });
  };

  return (
    <Modal
      title={editingPrompt ? 'Edit AI Prompt' : 'Save AI Prompt'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={editingPrompt ? 'Update Prompt' : 'Save Prompt'}
      cancelText="Cancel"
      confirmLoading={mutation.isPending}
      width={560}
      style={{ top: 30 }}
      styles={modalBodyStyles}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
        <div>
          <label style={labelStyle}>SAVE IN</label>
          <FolderPicker
            spaceId={space?._id}
            value={folderId}
            onChange={setFolderId}
            allowRoot={true}
          />
        </div>
        <div>
          <label style={labelStyle}>PROMPT TITLE</label>
          <Input placeholder="e.g. Code Review Assistant" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>CAPTION / DESCRIPTION</label>
          <Input placeholder="What is this prompt best used for..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={200} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>TARGET AI MODEL</label>
            <Select options={AI_MODELS} style={{ width: '100%' }} value={model} onChange={setModel} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>TAGS</label>
            <Select mode="tags" style={{ width: '100%' }} placeholder="Tags..." value={tags} onChange={setTags} />
          </div>
        </div>
        {model === 'Custom' && (
          <div>
            <label style={labelStyle}>CUSTOM MODEL NAME</label>
            <Input placeholder="e.g. Claude 3 Opus" value={customModel} onChange={e => setCustomModel(e.target.value)} />
          </div>
        )}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={labelStyle}>PROMPT BODY</label>
            <span style={{ fontSize: '10px', color: body.length > 4500 ? '#ef4444' : '#666' }}>{body.length} / 5000 chars</span>
          </div>
          <Input.TextArea
            placeholder="Paste the full prompt instructions here..."
            value={body} onChange={e => setBody(e.target.value)}
            maxLength={5000} rows={8}
            style={{ height: 200, resize: 'vertical', maxHeight: 400, overflowY: 'auto' }}
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── 6. COMMUNITY MODAL ───────────────────────────────────────────────────────
export function QuickAddCommunityModal({ open, onClose, space, editingCommunity = null, defaultFolderId = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [name, setName]               = useState('');
  const [url, setUrl]                 = useState('');
  const [platform, setPlatform]       = useState('discord');
  const [caption, setCaption]         = useState('');
  const [folderId, setFolderId]       = useState(defaultFolderId);
  const [tags, setTags]               = useState([]);
  const [memberCount, setMemberCount] = useState('');

  useEffect(() => {
    if (open) {
      if (editingCommunity) {
        setName(editingCommunity.title || editingCommunity.name || '');
        setUrl(editingCommunity.url || '');
        setPlatform(editingCommunity.platform || 'discord');
        setCaption(editingCommunity.caption || '');
        setFolderId(editingCommunity.folderId || defaultFolderId || null);
        setTags(editingCommunity.tags || []);
        setMemberCount(editingCommunity.memberCount || '');
      } else {
        setName('');
        setUrl('');
        setPlatform('discord');
        setCaption('');
        setFolderId(defaultFolderId || null);
        setTags([]);
        setMemberCount('');
      }
    }
  }, [open, editingCommunity, defaultFolderId]);

  const detectPlatform = (inputUrl) => {
    if (!inputUrl) return;
    const lower = inputUrl.toLowerCase();
    if (lower.includes('discord.gg') || lower.includes('discord.com')) setPlatform('discord');
    else if (lower.includes('reddit.com')) setPlatform('reddit');
    else if (lower.includes('slack.com')) setPlatform('slack');
    else if (lower.includes('twitter.com') || lower.includes('x.com')) setPlatform('twitter');
    else if (lower.includes('youtube.com') || lower.includes('youtu.be')) setPlatform('youtube');
    else if (lower.includes('github.com')) setPlatform('github');
    else if (lower.includes('t.me') || lower.includes('telegram.me')) setPlatform('telegram');
    else if (lower.includes('whatsapp.com')) setPlatform('whatsapp');
  };

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (editingCommunity) {
        return api.patch(`/api/spaces/${space._id}/items/${editingCommunity._id}`, payload);
      }
      return api.post(`/api/spaces/${space._id}/items`, { ...payload, type: 'community' });
    },
    onSuccess: (res) => {
      message.success(editingCommunity ? 'Community updated!' : 'Community link added!');
      queryClient.invalidateQueries(['items', space._id, 'community']);
      queryClient.invalidateQueries(['items', space._id, 'all']);
      queryClient.invalidateQueries(['communities', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['history', space._id]);
      onSuccess?.(res.data?.item || res.data?.community);
      onClose();
    },
    onError: (err) => message.error(err.response?.data?.error || 'Failed to add community'),
  });

  const handleOk = () => {
    if (!name || !url) { message.error('Name and URL are required'); return; }
    mutation.mutate({
      title: name,
      url,
      platform,
      caption,
      folderId: folderId || null,
      tags,
      memberCount
    });
  };

  return (
    <Modal
      title={editingCommunity ? 'Edit Community Resource' : 'Link New Community Resource'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText={editingCommunity ? 'Update Community' : 'Add Community'}
      cancelText="Cancel"
      confirmLoading={mutation.isPending}
      width={540}
      style={{ top: 30 }}
      styles={modalBodyStyles}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
        <div>
          <label style={labelStyle}>SAVE IN</label>
          <FolderPicker
            spaceId={space?._id}
            value={folderId}
            onChange={setFolderId}
            allowRoot={true}
          />
        </div>
        <div>
          <label style={labelStyle}>COMMUNITY LINK URL</label>
          <Input placeholder="e.g. https://discord.gg/react" value={url} onChange={e => setUrl(e.target.value)} onBlur={() => detectPlatform(url)} />
        </div>
        <div>
          <label style={labelStyle}>COMMUNITY NAME</label>
          <Input placeholder="e.g. React Developers Discord" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>ABOUT / DESCRIPTION</label>
          <Input placeholder="What is this community useful for..." value={caption} onChange={e => setCaption(e.target.value)} maxLength={200} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>PLATFORM TYPE</label>
            <Select options={COMMUNITY_PLATFORMS} style={{ width: '100%' }} value={platform} onChange={setPlatform} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>EST. MEMBER COUNT / STATUS</label>
            <Input placeholder="e.g. 45K members or Active" value={memberCount} onChange={e => setMemberCount(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>TAGS</label>
          <Select mode="tags" style={{ width: '100%' }} placeholder="Tags..." value={tags} onChange={setTags} />
        </div>
      </div>
    </Modal>
  );
}

// ─── 7. NOTE MODAL ───────────────────────────────────────────────────────────
export function QuickAddNoteModal({ open, onClose, space, defaultFolderId = null, onSuccess }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState(defaultFolderId);
  const [tags, setTags] = useState([]);

  // Fetch folders for destination selection
  const { data: foldersData } = useQuery({
    queryKey: ['folders', space?._id],
    queryFn: async () => {
      if (!space?._id) return [];
      const res = await api.get(`/api/spaces/${space._id}/folders`);
      return res.data.folders || [];
    },
    enabled: !!space?._id
  });

  const folders = foldersData || [];

  useEffect(() => {
    if (open) {
      setTitle('');
      setContent('');
      setTags([]);
      setFolderId(defaultFolderId || null);
    }
  }, [open, defaultFolderId]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      return api.post(`/api/spaces/${space._id}/items`, {
        type: 'note',
        ...payload
      });
    },
    onSuccess: (res) => {
      message.success('Note created!');
      queryClient.invalidateQueries(['items', space._id]);
      queryClient.invalidateQueries(['folders', space._id]);
      queryClient.invalidateQueries(['space', space._id]);
      queryClient.invalidateQueries(['history', space._id]);
      onSuccess?.(res.data?.item);
      onClose();
    },
    onError: (err) => message.error(err.response?.data?.error || 'Failed to create note'),
  });

  const handleOk = () => {
    if (!title.trim()) {
      message.error('Note title is required');
      return;
    }
    mutation.mutate({
      title: title.trim(),
      content: content || `# ${title.trim()}\n\nStart writing notes...`,
      folderId,
      tags
    });
  };

  return (
    <Modal
      title="Create New Note"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Create Note"
      cancelText="Cancel"
      confirmLoading={mutation.isPending}
      width={540}
      style={{ top: 30 }}
      styles={modalBodyStyles}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
        <div>
          <label style={labelStyle}>NOTE TITLE</label>
          <Input
            placeholder="e.g. Authentication Flow, Spring Security JWT"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>SAVE IN</label>
          <FolderPicker
            spaceId={space?._id}
            value={folderId}
            onChange={setFolderId}
            allowRoot={true}
          />
        </div>

        <div>
          <label style={labelStyle}>INITIAL CONTENT (OPTIONAL MARKDOWN)</label>
          <Input.TextArea
            rows={4}
            placeholder="Add initial notes or draft content..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>TAGS</label>
          <Select mode="tags" style={{ width: '100%' }} placeholder="Add tags..." value={tags} onChange={setTags} />
        </div>
      </div>
    </Modal>
  );
}
