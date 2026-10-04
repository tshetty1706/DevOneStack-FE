import { useEffect, useRef } from 'react';
import api from '../api/axios';

/**
 * Custom hook to track meaningful read engagement on an item.
 * Automatically pauses when the tab is hidden or backgrounded.
 * Sends at most ONE engagement signal after 30s of focused time or meaningful interaction (scroll/copy).
 *
 * @param {string} spaceId
 * @param {string} itemId
 * @param {boolean} enabled
 */
export function useItemEngagement(spaceId, itemId, enabled = true) {
  const activeSecondsRef = useRef(0);
  const timerRef = useRef(null);
  const hasSentRef = useRef(false);

  useEffect(() => {
    if (!enabled || !spaceId || !itemId) return;

    hasSentRef.current = false;
    activeSecondsRef.current = 0;

    const sendEngagementSignal = (meaningfulInteraction = false) => {
      if (hasSentRef.current) return;
      hasSentRef.current = true;

      api.post(`/api/spaces/${spaceId}/items/${itemId}/read`, {
        durationSeconds: activeSecondsRef.current,
        meaningfulInteraction: Boolean(meaningfulInteraction),
      }).catch(() => {
        // Silently catch - the server will record points if eligible
      });
    };

    // Increment active focused seconds
    const startTimer = () => {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          if (document.visibilityState === 'visible') {
            activeSecondsRef.current += 1;
            if (activeSecondsRef.current >= 30) {
              sendEngagementSignal(false);
              stopTimer();
            }
          }
        }, 1000);
      }
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTimer();
      } else {
        stopTimer();
      }
    };

    // User interactions: copy or scroll
    const handleCopy = () => {
      if (activeSecondsRef.current >= 5) {
        sendEngagementSignal(true);
      }
    };

    const handleScroll = () => {
      if (activeSecondsRef.current >= 10) {
        sendEngagementSignal(true);
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [spaceId, itemId, enabled]);
}

export default useItemEngagement;
