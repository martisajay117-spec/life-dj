import { Pause, Play, SkipBack, SkipForward, Square, Volume2 } from "lucide-react";
import { imageUrl } from "../data.js";

export default function NowPlaying({
  mood,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onStop,
  musicCategory,
  cooldownSeconds,
}) {
  return (
    <section className="now-playing-card" id="music">
      <div className="section-eyebrow"><span className="eyebrow-line" /> {musicCategory || "A SOUNDTRACK FOR RIGHT NOW"}</div>
      <div className="track-art-wrap">
        <img className="track-art" src={imageUrl(mood.art, 900)} alt={`${mood.name} soundtrack artwork`} />
        <div className="art-shade" />
        <div className="art-label"><span className="playing-bars"><i /><i /><i /><i /></span> CURATED FOR YOUR {mood.name.toUpperCase()} ERA</div>
      </div>
      <div className="track-meta">
        <div>
          <h3>{mood.track}</h3>
          <p>{mood.artist}</p>
        </div>
        <button className="volume-button" type="button" aria-label="Volume controls are unavailable in demo"><Volume2 size={17} /></button>
      </div>
      <div className="progress-meta"><span>DEMO PREVIEW</span><span>{cooldownSeconds > 0 ? `REPLAY IN ${cooldownSeconds}S` : "NO AUDIO"}</span></div>
      <div className="progress-track"><span /></div>
      <div className="player-controls">
        <button type="button" aria-label="Previous mock track" onClick={onPrevious}><SkipBack size={17} fill="currentColor" /></button>
        <button className="play-button" type="button" onClick={onTogglePlay} disabled={!isPlaying && cooldownSeconds > 0} aria-label={isPlaying ? "Pause demo preview" : cooldownSeconds > 0 ? `Replay available in ${cooldownSeconds} seconds` : "Play demo preview"}>
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="play-icon" />}
        </button>
        <button type="button" aria-label="Stop demo preview" onClick={onStop} disabled={!isPlaying}><Square size={13} fill="currentColor" /></button>
        <button type="button" aria-label="Next mock track" onClick={onNext}><SkipForward size={17} fill="currentColor" /></button>
      </div>
      <p className="mock-disclaimer">Mock playback controls · no music is streamed{cooldownSeconds > 0 ? ` · replay cooldown ${cooldownSeconds}s` : ""}</p>
    </section>
  );
}
