import {
  AudioLines,
  LoaderCircle,
  Mic,
  Pause,
  Play,
  Sparkles,
  Square,
} from "lucide-react";

export default function ListeningCard({
  listening,
  speechMode,
  speechError,
  speechSupported,
  isAnalyzing,
  onStartListening,
  onPauseListening,
  onResumeListening,
  onStopListening,
  mood,
  confidence,
  analysis,
}) {
  const active = speechMode === "listening" || speechMode === "paused";
  const busy = speechMode === "processing" || isAnalyzing;
  const statusLabel = busy
    ? "ANALYZING CONTEXT"
    : speechMode === "listening"
      ? "LISTENING · SHORT SESSION"
      : speechMode === "paused"
        ? "LISTENING PAUSED"
        : "MICROPHONE OFF";
  const micAction = speechMode === "listening"
    ? onStopListening
    : speechMode === "paused"
      ? onResumeListening
      : onStartListening;

  return (
    <section className={`listening-card ${listening ? "is-listening" : ""}`} aria-label="Mood detection">
      <div className="listening-orb-wrap">
        <div className="orb-ring ring-one" />
        <div className="orb-ring ring-two" />
        <button
          className="mic-button"
          type="button"
          onClick={micAction}
          disabled={busy || !speechSupported}
          aria-label={speechMode === "listening" ? "Turn listening off" : speechMode === "paused" ? "Resume listening" : "Turn listening on"}
          aria-pressed={speechMode === "listening"}
        >
          {busy ? <LoaderCircle size={25} className="loading-icon" /> : <Mic size={26} strokeWidth={1.75} />}
        </button>
        <span className="mic-spark spark-one">✦</span>
        <span className="mic-spark spark-two">✧</span>
      </div>
      <div className="listen-copy">
        <div className="listen-status" aria-live="polite">
          <span className={`status-dot ${listening ? "live" : speechMode === "paused" ? "paused" : ""}`} />
          {statusLabel}
        </div>
        <h2>{speechMode === "listening" ? "I’m right here." : speechMode === "paused" ? "Taking a pause." : busy ? "Making sense of it." : "Ready when you are."}</h2>
        <p>{analysis?.explanation || (speechMode === "listening" ? "Short speech session; browser speech services may process audio. LIFE DJ doesn’t store audio or transcripts." : speechMode === "paused" ? "Your microphone is paused. Resume or stop whenever you like." : busy ? "Your temporary transcript is being analyzed and then discarded." : speechSupported ? "Tap the mic when you’re ready. Your browser will ask for microphone permission." : "Speech recognition isn’t supported here. You can still type a temporary transcript below.")}</p>
        <div className="detected-line">
          <span className="detected-label"><Sparkles size={13} /> DETECTED MOOD</span>
          <span className="detected-value">
            {mood.name}
            <span>{analysis ? `${confidence}% match` : mood.id === "neutral" ? "not analyzed" : "user selected"}</span>
          </span>
        </div>
        {active && (
          <div className="mic-controls">
            {speechMode === "listening"
              ? <button type="button" onClick={onPauseListening}><Pause size={11} fill="currentColor" /> Pause</button>
              : <button type="button" onClick={onResumeListening}><Play size={11} fill="currentColor" /> Resume</button>}
            <button type="button" onClick={onStopListening}><Square size={10} fill="currentColor" /> Stop</button>
          </div>
        )}
        {analysis && (
          <div className="analysis-meta">
            <span>ABOUT {analysis.subject === "user" ? "YOU" : analysis.subject === "someone_else" ? "SOMEONE ELSE" : "UNCLEAR"}</span>
            <span>{analysis.music_category}</span>
            {analysis.needs_confirmation && <span className="confirmation-tag">CONFIRM BEFORE PLAY</span>}
          </div>
        )}
      </div>
      <div className="sound-wave" aria-hidden="true">
        {Array.from({ length: 31 }, (_, i) => <i key={i} style={{ "--bar": `${12 + ((i * 17 + 13) % 38)}px`, "--delay": `${(i % 7) * 0.1}s` }} />)}
      </div>
      <div className="listen-card-footer"><AudioLines size={13} /> {speechMode === "listening" ? "MICROPHONE ACTIVE · 10 SECOND SESSION" : "NO AUDIO STORED BY LIFE DJ · SHORT SESSIONS"}</div>
      {speechError && <p className="microphone-error" role="alert">{speechError}</p>}
    </section>
  );
}
