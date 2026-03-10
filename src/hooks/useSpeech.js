import { useEffect, useRef, useState } from 'react';

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

/**
 * useSpeech — real-time speech-to-text
 * Primary: Deepgram WebSocket streaming (works on all browsers)
 * Fallback: Web Speech API (Chrome/Edge only)
 */
export function useSpeech({ onResult, active, onError }) {
  const activeRef = useRef(active);
  const cleanupRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);
  activeRef.current = active;

  // Determine which engine to use
  const useDeepgram = !!DEEPGRAM_API_KEY;

  useEffect(() => {
    if (useDeepgram) {
      return setupDeepgram(activeRef, onResult, onError, setIsSupported, cleanupRef);
    } else {
      return setupWebSpeech(activeRef, onResult, onError, setIsSupported, cleanupRef);
    }
  }, []);

  useEffect(() => {
    if (!cleanupRef.current) return;
    if (active) cleanupRef.current.start?.();
    else cleanupRef.current.stop?.();
  }, [active]);

  return { isSupported };
}

// ── Deepgram streaming via WebSocket + MediaRecorder ──
function setupDeepgram(activeRef, onResult, onError, setIsSupported, cleanupRef) {
  let socket = null;
  let mediaStream = null;
  let mediaRecorder = null;
  let isConnected = false;

  async function start() {
    if (isConnected) return;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      onError?.('permission_denied');
      setIsSupported(false);
      return;
    }

    const wsUrl = `wss://api.deepgram.com/v1/listen?` +
      `model=nova-2&language=en&smart_format=false&` +
      `interim_results=true&utterance_end_ms=1500&vad_events=true&` +
      `punctuate=false&encoding=linear16&sample_rate=16000&channels=1`;

    socket = new WebSocket(wsUrl, ['token', DEEPGRAM_API_KEY]);

    socket.onopen = () => {
      isConnected = true;
      // Start recording and stream audio chunks
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(mediaStream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!isConnected || socket.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert float32 to int16
        const int16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        socket.send(int16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // Store for cleanup
      cleanupRef.current._audioContext = audioContext;
      cleanupRef.current._processor = processor;
      cleanupRef.current._source = source;
    };

    socket.onmessage = (event) => {
      if (!activeRef.current) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'Results' && data.channel?.alternatives?.[0]) {
          const alt = data.channel.alternatives[0];
          const transcript = alt.transcript;
          if (transcript) {
            onResult?.(transcript, data.is_final);
          }
        }
      } catch (_) {}
    };

    socket.onerror = () => {
      onError?.('deepgram_error');
    };

    socket.onclose = () => {
      isConnected = false;
      // Auto-reconnect if still active
      if (activeRef.current) {
        setTimeout(() => start(), 1000);
      }
    };
  }

  function stop() {
    isConnected = false;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'CloseStream' }));
      socket.close();
    }
    socket = null;
    if (cleanupRef.current?._processor) {
      cleanupRef.current._processor.disconnect();
      cleanupRef.current._source?.disconnect();
      try { cleanupRef.current._audioContext?.close(); } catch (_) {}
      cleanupRef.current._audioContext = null;
      cleanupRef.current._processor = null;
      cleanupRef.current._source = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }
  }

  cleanupRef.current = { start, stop };
  setIsSupported(true);

  return () => stop();
}

// ── Web Speech API fallback ──
function setupWebSpeech(activeRef, onResult, onError, setIsSupported, cleanupRef) {
  const hasSpeechAPI = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!hasSpeechAPI) {
    onError?.('not_supported');
    setIsSupported(false);
    cleanupRef.current = { start: () => {}, stop: () => {} };
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'en-US';
  rec.maxAlternatives = 3;

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

  setIsSupported(true);
  cleanupRef.current = {
    start: () => { try { rec.start(); } catch (_) {} },
    stop: () => { try { rec.stop(); } catch (_) {} },
  };

  return () => { try { rec.abort(); } catch (_) {} };
}
