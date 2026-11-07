import { LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";

export default function TranscriptInput({
  value,
  onChange,
  onSubmit,
  isAnalyzing,
  error,
}) {
  return (
    <form className="transcript-card" onSubmit={onSubmit}>
      <div className="transcript-heading">
        <div>
          <span className="eyebrow">A LITTLE CONTEXT GOES A LONG WAY</span>
          <h2>What’s going on?</h2>
        </div>
        <span className="transcript-privacy"><LockKeyhole size={12} /> TEMPORARY</span>
      </div>
      <label className="sr-only" htmlFor="transcript">
        Conversation transcript
      </label>
      <textarea
        id="transcript"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={5000}
        placeholder="Share a little of what’s on your mind, or a conversation that’s been on repeat..."
        rows={3}
        disabled={isAnalyzing}
      />
      <div className="transcript-footer">
        <span className="privacy-caption">Sent to Gemini for this request. Not saved by LIFE DJ.</span>
        <button className="analyze-button" type="submit" disabled={isAnalyzing || !value.trim()}>
          {isAnalyzing ? <LoaderCircle size={14} className="loading-icon" /> : <Sparkles size={14} />}
          {isAnalyzing ? "Reading the context..." : "Find my mood"}
        </button>
      </div>
      {error && <p className="transcript-error" role="alert">{error}</p>}
    </form>
  );
}
