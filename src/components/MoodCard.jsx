import { ArrowUpRight } from "lucide-react";

export default function MoodCard({ mood, selected, onSelect }) {
  return (
    <button
      className={`mood-card ${selected ? "selected" : ""}`}
      type="button"
      onClick={onSelect}
      style={{ "--mood": mood.color, "--mood-tint": mood.tint }}
      aria-pressed={selected}
    >
      <span className="mood-icon">{mood.icon}</span>
      <span className="mood-card-copy"><strong>{mood.name}</strong><small>{mood.note}</small></span>
      <ArrowUpRight className="mood-arrow" size={15} />
    </button>
  );
}
