import { useCallback, useEffect, useState } from "react";
import { Bell, ChevronDown, CircleHelp, Menu, Search, Sparkles } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import ListeningCard from "./components/ListeningCard.jsx";
import MoodCard from "./components/MoodCard.jsx";
import NowPlaying from "./components/NowPlaying.jsx";
import RecentHistory from "./components/RecentHistory.jsx";
import Recommendations from "./components/Recommendations.jsx";
import TranscriptInput from "./components/TranscriptInput.jsx";
import { moods, neutralMood, recentMoods } from "./data.js";
import useSpeechRecognition from "./hooks/useSpeechRecognition.js";

const initialMood = neutralMood;
const todayLabel = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date()).toUpperCase();

export default function App() {
  const [mood, setMood] = useState(initialMood);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState(recentMoods);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmedPlayback, setConfirmedPlayback] = useState(false);
  const [trackCooldowns, setTrackCooldowns] = useState({});
  const [clock, setClock] = useState(Date.now());

  const analyzeTranscriptText = useCallback(async (text) => {
    if (!text.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/api/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text.trim() }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || "Mood analysis failed. Please try again.");
      }

      const matchedMood = moods.find((item) => item.id === result.mood) || neutralMood;
      const nextMood = {
        ...matchedMood,
        confidence: Math.round(result.confidence_score * 100),
      };
      setMood(nextMood);
      setAnalysis(result);
      setIsPlaying(false);
      setConfirmationOpen(false);
      setConfirmedPlayback(false);
      setHistory((previous) => [
        {
          mood: nextMood.name,
          time: "Just now",
          color: nextMood.color,
          icon: nextMood.icon,
        },
        ...previous.filter((item) => item.mood !== nextMood.name),
      ].slice(0, 3));
      setTranscript("");
    } catch (error) {
      setAnalysisError(
        error instanceof TypeError
          ? "Can’t reach the AI service. Start the LIFE DJ backend and try again."
          : error.message,
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const analyzeTranscript = (event) => {
    event.preventDefault();
    if (!transcript.trim()) return;
    const temporaryTranscript = transcript;
    setTranscript("");
    void analyzeTranscriptText(temporaryTranscript);
  };
  const handleSpeechTranscript = useCallback(
    (temporaryTranscript) => analyzeTranscriptText(temporaryTranscript),
    [analyzeTranscriptText],
  );
  const speech = useSpeechRecognition(handleSpeechTranscript);

  const chooseMood = (nextMood) => {
    if (isPlaying && nextMood.id !== mood.id) {
      setTrackCooldowns((current) => ({
        ...current,
        [mood.id]: Date.now() + 30_000,
      }));
    }
    if (nextMood.id !== mood.id) setIsPlaying(false);
    setMood(nextMood);
    setAnalysis(null);
    setConfirmationOpen(false);
    setConfirmedPlayback(false);
    setHistory((previous) => [
      { mood: nextMood.name, time: "Just now", color: nextMood.color, icon: nextMood.icon },
      ...previous.filter((item) => item.mood !== nextMood.name),
    ].slice(0, 3));
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else if (cooldownSeconds > 0) {
      return;
    } else if (analysis?.needs_confirmation && !confirmedPlayback) {
      setConfirmationOpen(true);
    } else {
      setIsPlaying(true);
    }
  };

  const stopPlayback = () => {
    if (isPlaying) {
      setTrackCooldowns((current) => ({
        ...current,
        [mood.id]: Date.now() + 30_000,
      }));
    }
    setIsPlaying(false);
  };

  const currentCooldownUntil = trackCooldowns[mood.id] || 0;
  const cooldownSeconds = Math.max(0, Math.ceil((currentCooldownUntil - clock) / 1000));

  useEffect(() => {
    if (!Object.values(trackCooldowns).some((until) => until > Date.now())) return undefined;
    const intervalId = window.setInterval(() => {
      const currentTime = Date.now();
      setClock(currentTime);
      if (!Object.values(trackCooldowns).some((until) => until > currentTime)) {
        window.clearInterval(intervalId);
      }
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [trackCooldowns]);

  const confirmPlayback = () => {
    if (cooldownSeconds > 0) return;
    setConfirmationOpen(false);
    setConfirmedPlayback(true);
    setIsPlaying(true);
  };
  const nextTrack = (direction = 1) => {
    const currentIndex = Math.max(0, moods.findIndex((item) => item.id === mood.id));
    for (let step = 1; step <= moods.length; step += 1) {
      const candidate = moods[
        (currentIndex + direction * step + moods.length * 2) % moods.length
      ];
      if ((trackCooldowns[candidate.id] || 0) <= Date.now()) {
        chooseMood(candidate);
        return;
      }
    }
  };

  return (
    <div className="app-shell" id="home">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand"><button type="button" className="mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation"><Menu size={19} /></button><span>LIFE<span>DJ</span></span></div>
          <div className="breadcrumb"><span>Your space</span><span className="crumb-slash">/</span><strong>Discover</strong></div>
          <div className="topbar-actions">
            <div className="ai-pill"><span className={`ai-pulse ${analysisError ? "offline" : ""}`} /><Sparkles size={13} /> GEMINI AI <b>{isAnalyzing ? "THINKING" : analysisError ? "OFFLINE" : analysis ? "CONNECTED" : "NOT CHECKED"}</b></div>
            <button className="icon-button help-button" type="button" aria-label="Help"><CircleHelp size={18} /></button>
            <button className="icon-button notification-button" type="button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <div className="topbar-divider" />
            <button className="account-button" type="button"><span className="avatar small-avatar">A</span><ChevronDown size={14} /></button>
          </div>
        </header>
        {mobileMenuOpen && <div className="mobile-menu-panel"><a href="#discover" onClick={() => setMobileMenuOpen(false)}>Discover</a><a href="#moments" onClick={() => setMobileMenuOpen(false)}>Your moments</a><a href="#music" onClick={() => setMobileMenuOpen(false)}>Your music</a></div>}

        <div className="dashboard">
          <section className="welcome-row">
            <div className="welcome-copy">
              <span className="eyebrow welcome-eyebrow"><span className="welcome-spark">✦</span> YOUR PERSONAL SOUNDTRACK</span>
              <h1>Your life.<br className="mobile-break" /> <span>Your soundtrack.</span></h1>
              <p>Whatever you’re feeling, there’s a sound for it.<br className="desktop-break" /> Let’s find yours.</p>
            </div>
            <div className="date-chip"><span className="date-orb" /> {todayLabel} <span className="date-divider" /> <Search size={14} /></div>
          </section>

          <section className="dashboard-grid">
            <div className="primary-column">
              <ListeningCard
                listening={speech.mode === "listening"}
                speechMode={speech.mode}
                speechError={speech.error}
                speechSupported={speech.supported}
                isAnalyzing={isAnalyzing}
                onStartListening={speech.start}
                onPauseListening={speech.pause}
                onResumeListening={speech.resume}
                onStopListening={speech.stop}
                mood={mood}
                confidence={mood.confidence}
                analysis={analysis}
              />
              <TranscriptInput
                value={transcript}
                onChange={setTranscript}
                onSubmit={analyzeTranscript}
                isAnalyzing={isAnalyzing}
                error={analysisError}
              />
              <section className="mood-section">
                <div className="section-heading mood-heading">
                  <div><span className="eyebrow">TUNE INTO A FEELING</span><h2>What’s the mood?</h2></div>
                  <button type="button" className="text-button mood-help">Not sure? <span>Let AI decide</span><Sparkles size={13} /></button>
                </div>
                <div className="mood-grid">
                  {moods.map((item) => <MoodCard key={item.id} mood={item} selected={mood.id === item.id} onSelect={() => chooseMood(item)} />)}
                </div>
              </section>
              <Recommendations onChoose={(index) => chooseMood(moods[[2, 5, 3][index]])} />
            </div>
            <aside className="secondary-column">
              <NowPlaying
                mood={mood}
                isPlaying={isPlaying}
                onTogglePlay={togglePlayback}
                onNext={() => nextTrack(1)}
                onPrevious={() => nextTrack(-1)}
                onStop={stopPlayback}
                musicCategory={analysis?.music_category}
                cooldownSeconds={cooldownSeconds}
              />
              <RecentHistory items={history} />
              <div className="privacy-note"><span className="privacy-icon">✦</span><span><strong>Your feelings stay yours.</strong><small>Private by nature. Always.</small></span><ChevronDown size={14} className="privacy-chevron" /></div>
            </aside>
          </section>
          <footer className="page-footer"><span>© {new Date().getFullYear()} LIFE DJ</span><span>MADE FOR THE MOMENT <i>✦</i></span><span>MOCK DATA · DEMO EXPERIENCE</span></footer>
        </div>
      </main>
      {confirmationOpen && (
        <div className="confirmation-backdrop" role="presentation" onClick={() => setConfirmationOpen(false)}>
          <section
            className="confirmation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="confirmation-icon"><Sparkles size={18} /></span>
            <span className="eyebrow">A QUICK CHECK-IN</span>
            <h2 id="confirmation-title">Does this feel right?</h2>
            <p>This moment is a little ambiguous. LIFE DJ read it as <strong>{mood.name.toLowerCase()}</strong>. Want to continue with a mock soundtrack?</p>
            <div className="confirmation-actions">
              <button type="button" className="cancel-confirmation" onClick={() => setConfirmationOpen(false)}>Not now</button>
              <button type="button" className="confirm-playback" onClick={confirmPlayback} disabled={cooldownSeconds > 0}>Yes, play preview</button>
            </div>
            <small>Demo only · No audio will play</small>
          </section>
        </div>
      )}
    </div>
  );
}
