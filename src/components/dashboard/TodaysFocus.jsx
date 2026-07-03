import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Select, Input } from 'antd';
import {
  RiTargetLine, RiEditLine, RiCloseLine,
  RiPlayLine, RiPauseLine, RiStopLine,
} from 'react-icons/ri';
import { useTheme } from '../../context/ThemeContext';

const STACK_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'add', label: '+ Add new' },
];

function formatTime(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function TodaysFocus() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Colors
  const bg = isLight ? '#ffffff' : '#111111';
  const border = isLight ? '#e0e0e0' : '#222222';
  const hoverBorder = isLight ? '#999999' : '#444444';
  const timerBg = isLight ? '#f5f5f5' : '#0a0a0a';
  const timerBorder = isLight ? '#e0e0e0' : '#1a1a1a';
  const textPrimary = isLight ? '#0a0a0a' : '#ffffff';
  const textMuted = isLight ? '#666666' : '#666666';
  const textSub = isLight ? '#cccccc' : '#333333';
  const inputBg = isLight ? '#f5f5f5' : '#0a0a0a';
  const inputBorderColor = isLight ? '#e0e0e0' : '#222222';
  const focusBorder = isLight ? '#0a0a0a' : '#ffffff';
  const ghostBtn = {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '3px 8px', borderRadius: '6px', cursor: 'pointer',
    border: `1px solid ${border}`, background: 'transparent',
    color: textMuted, fontSize: '12px', fontFamily: 'var(--font-body)',
    transition: 'border-color 0.15s ease, color 0.15s ease',
  };

  // Persisted state
  const [goal, setGoal] = useState(() => localStorage.getItem('dos_focus_goal') || '');
  const [stack, setStack] = useState(() => localStorage.getItem('dos_focus_stack') || 'react');

  // Timer
  const [timerSecs, setTimerSecs] = useState(() => {
    const ts = localStorage.getItem('dos_timer_start');
    if (ts) return Math.floor((Date.now() - parseInt(ts)) / 1000);
    return 0;
  });
  const [running, setRunning] = useState(() => !!localStorage.getItem('dos_timer_start'));
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const ts = localStorage.getItem('dos_timer_start');
        if (ts) setTimerSecs(Math.floor((Date.now() - parseInt(ts)) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleStart = () => {
    if (!running) {
      const now = Date.now() - timerSecs * 1000;
      localStorage.setItem('dos_timer_start', String(now));
      setRunning(true);
    } else {
      // Pause
      clearInterval(intervalRef.current);
      localStorage.removeItem('dos_timer_start');
      setRunning(false);
    }
  };

  const handleStop = () => {
    clearInterval(intervalRef.current);
    localStorage.removeItem('dos_timer_start');
    setRunning(false);
    setTimerSecs(0);
  };

  const handleGoalBlur = (e) => localStorage.setItem('dos_focus_goal', e.target.value);
  const handleStackChange = (val) => {
    setStack(val);
    localStorage.setItem('dos_focus_stack', val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: bg, border: `1px solid ${border}`,
        borderRadius: '12px', padding: '18px',
        display: 'flex', flexDirection: 'column', gap: '14px',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = hoverBorder}
      onMouseLeave={e => e.currentTarget.style.borderColor = border}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RiTargetLine size={14} style={{ color: textMuted }} />
          <span style={{
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
            color: textMuted, fontWeight: 600,
          }}>Today's Focus</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button style={ghostBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}>
            <RiEditLine size={11} /> Edit
          </button>
          <button style={ghostBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}>
            <RiCloseLine size={11} /> Clear
          </button>
        </div>
      </div>

      {/* Stack selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: textMuted, minWidth: '40px' }}>Stack</span>
        <Select
          value={stack}
          onChange={handleStackChange}
          options={STACK_OPTIONS}
          style={{ flex: 1 }}
          styles={{
            popup: { root: { background: isLight ? '#ffffff' : '#111111', border: `1px solid ${border}` } },
          }}
        />
      </div>

      {/* Goal input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: textMuted, minWidth: '40px' }}>Goal</span>
        <Input
          value={goal}
          onChange={e => setGoal(e.target.value)}
          onBlur={handleGoalBlur}
          placeholder="What are you building or learning today?"
          style={{
            background: inputBg, borderColor: inputBorderColor,
            color: textPrimary, fontSize: '13px',
          }}
          styles={{ input: { color: textPrimary } }}
        />
      </div>

      {/* Timer block */}
      <div style={{
        background: timerBg, border: `1px solid ${timerBorder}`,
        borderRadius: '10px', padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '28px', fontWeight: 500, letterSpacing: '0.04em',
            color: textPrimary, lineHeight: 1,
          }}>
            {formatTime(timerSecs)}
          </div>
          <div style={{ fontSize: '11px', color: textMuted, marginTop: '4px' }}>
            Session Timer
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleStart}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 13px', borderRadius: '8px', cursor: 'pointer',
              border: `1px solid ${isLight ? '#e0e0e0' : '#333333'}`,
              background: running ? (isLight ? '#0a0a0a' : '#ffffff') : 'transparent',
              color: running ? (isLight ? '#ffffff' : '#0a0a0a') : textMuted,
              fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-body)',
              transition: 'all 0.15s ease',
            }}
          >
            {running ? <RiPauseLine size={13} /> : <RiPlayLine size={13} />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleStop}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 13px', borderRadius: '8px', cursor: 'pointer',
              border: `1px solid ${isLight ? '#e0e0e0' : '#333333'}`,
              background: 'transparent', color: textMuted,
              fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-body)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = focusBorder; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isLight ? '#e0e0e0' : '#333333'; e.currentTarget.style.color = textMuted; }}
          >
            <RiStopLine size={13} /> Stop
          </button>
        </div>
      </div>

      {/* Last session */}
      <div style={{ fontSize: '12px', color: textSub }}>
        Last session: <span style={{ color: textMuted }}>1h 12m · Yesterday</span>
      </div>
    </motion.div>
  );
}
