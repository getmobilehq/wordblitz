import { useEffect, useRef } from 'react';

export function useSpeech({ onResult, active, onError }) {
  const recRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  const isSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) { onError?.('not_supported'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 3;
    recRef.current = rec;

    rec.onresult = (event) => {
      if (!activeRef.current) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        onResult?.(transcript, event.results[i].isFinal);
      }
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') onError?.('permission_denied');
      else if (e.error === 'no-speech') { /* silent */ }
      else onError?.(e.error);
    };
    rec.onend = () => {
      if (activeRef.current) {
        try { rec.start(); } catch (_) {}
      }
    };
    return () => { try { rec.abort(); } catch (_) {} };
  }, []);

  useEffect(() => {
    const rec = recRef.current;
    if (!rec) return;
    if (active) { try { rec.start(); } catch (_) {} }
    else        { try { rec.stop();  } catch (_) {} }
  }, [active]);

  return { isSupported };
}
