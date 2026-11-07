import { useCallback, useEffect, useRef, useState } from "react";

const SESSION_LIMIT_MS = 10_000;

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function describeSpeechError(code) {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission was denied. Allow microphone access in your browser settings, then try again.";
    case "audio-capture":
      return "No microphone was found. Connect a microphone and try again.";
    case "network":
      return "Speech recognition could not connect. Check your connection and try again.";
    case "no-speech":
      return "No speech was detected. Start a new short listening session when you’re ready.";
    default:
      return "Speech recognition stopped unexpectedly. Please try again.";
  }
}

export default function useSpeechRecognition(onTranscript) {
  const [mode, setMode] = useState("idle");
  const [error, setError] = useState("");
  const [supported] = useState(() => Boolean(getSpeechRecognitionConstructor()));
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const sessionActiveRef = useRef(false);
  const pausedRef = useRef(false);
  const processingRef = useRef(false);
  const transcriptHandlerRef = useRef(onTranscript);

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript;
  }, [onTranscript]);

  const clearSessionTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback((abort = false) => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (!recognition) return;
    recognition.onstart = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      if (abort) recognition.abort();
      else recognition.stop();
    } catch (error) {
      if (error.name !== "InvalidStateError") throw error;
    }
  }, []);

  const startRecognition = useCallback(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      sessionActiveRef.current = false;
      pausedRef.current = false;
      setError("Speech recognition isn’t supported in this browser. Try a supported browser or type a transcript instead.");
      setMode("idle");
      return;
    }

    setError("");
    processingRef.current = false;
    let recognition;
    try {
      recognition = new Recognition();
      recognition.lang = navigator.language || "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        if (recognitionRef.current !== recognition) return;
        if (sessionActiveRef.current && !pausedRef.current) setMode("listening");
      };
      recognition.onresult = (event) => {
        if (recognitionRef.current !== recognition || processingRef.current || pausedRef.current) return;
        const transcript = Array.from(event.results)
          .filter((result) => result.isFinal)
          .map((result) => result[0]?.transcript || "")
          .join(" ")
          .trim();
        if (!transcript) return;

        processingRef.current = true;
        sessionActiveRef.current = false;
        pausedRef.current = false;
        clearSessionTimeout();
        setMode("processing");
        stopRecognition();
        Promise.resolve(transcriptHandlerRef.current(transcript)).then(
          () => setMode("idle"),
          () => setMode("idle"),
        );
      };
      recognition.onerror = (event) => {
        if (recognitionRef.current !== recognition) return;
        if (event.error === "aborted" && !sessionActiveRef.current) return;
        recognitionRef.current = null;
        sessionActiveRef.current = false;
        pausedRef.current = false;
        clearSessionTimeout();
        setMode("idle");
        if (event.error !== "aborted") setError(describeSpeechError(event.error));
      };
      recognition.onend = () => {
        if (recognitionRef.current !== recognition) return;
        recognitionRef.current = null;
        clearSessionTimeout();
        if (pausedRef.current) return;
        if (sessionActiveRef.current) {
          sessionActiveRef.current = false;
          setMode("idle");
          setError("Listening session ended. Turn listening on to start another short session.");
        }
      };

      sessionActiveRef.current = true;
      pausedRef.current = false;
      setMode("listening");
      recognition.start();
      timeoutRef.current = window.setTimeout(() => {
        if (sessionActiveRef.current && !pausedRef.current) {
          sessionActiveRef.current = false;
          stopRecognition(true);
          setMode("idle");
          setError("Short listening session ended. Turn listening on to start another one.");
        }
      }, SESSION_LIMIT_MS);
    } catch (startError) {
      sessionActiveRef.current = false;
      pausedRef.current = false;
      clearSessionTimeout();
      stopRecognition(true);
      setMode("idle");
      setError(
        startError.name === "NotAllowedError" || startError.name === "SecurityError"
          ? describeSpeechError("not-allowed")
          : "Could not start speech recognition. Check microphone access and try again.",
      );
    }
  }, [clearSessionTimeout, stopRecognition]);

  const start = useCallback(() => {
    if (mode === "listening" || mode === "processing") return;
    setError("");
    sessionActiveRef.current = true;
    pausedRef.current = false;
    startRecognition();
  }, [mode, startRecognition]);

  const pause = useCallback(() => {
    if (mode !== "listening") return;
    pausedRef.current = true;
    clearSessionTimeout();
    stopRecognition(true);
    setMode("paused");
  }, [clearSessionTimeout, mode, stopRecognition]);

  const resume = useCallback(() => {
    if (mode !== "paused") return;
    startRecognition();
  }, [mode, startRecognition]);

  const stop = useCallback(() => {
    sessionActiveRef.current = false;
    pausedRef.current = false;
    processingRef.current = false;
    clearSessionTimeout();
    stopRecognition(true);
    setMode("idle");
    setError("");
  }, [clearSessionTimeout, stopRecognition]);

  useEffect(() => () => {
    sessionActiveRef.current = false;
    pausedRef.current = false;
    clearSessionTimeout();
    stopRecognition(true);
  }, [clearSessionTimeout, stopRecognition]);

  return { mode, error, supported, start, pause, resume, stop };
}
