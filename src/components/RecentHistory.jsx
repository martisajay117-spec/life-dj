import { ArrowUpRight, Clock3 } from "lucide-react";

export default function RecentHistory({ items }) {
  return (
    <section className="history-card" id="moments">
      <div className="section-heading compact-heading">
        <div><span className="eyebrow">YOUR LISTENING JOURNEY</span><h2>Recent moments</h2></div>
        <button type="button" className="text-button">See all <ArrowUpRight size={14} /></button>
      </div>
      <div className="history-list">
        {items.map((item, index) => (
          <div className="history-item" key={`${item.mood}-${item.time}-${index}`}>
            <span className="history-icon" style={{ "--mood": item.color }}>{item.icon}</span>
            <span className="history-copy"><strong>{item.mood}</strong><small><Clock3 size={11} /> {item.time}</small></span>
            <button type="button" className="history-more" aria-label={`More about ${item.mood}`}>···</button>
          </div>
        ))}
      </div>
    </section>
  );
}
