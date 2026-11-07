import { ArrowRight, Headphones } from "lucide-react";
import { imageUrl } from "../data.js";

const recommendations = [
  { title: "Main character energy", subtitle: "For the days you need to remember who you are.", mood: "CONFIDENCE MIX", photo: "photo-1534447677768-be436bb09401", tone: "violet" },
  { title: "Soft landing", subtitle: "A little space to feel everything, gently.", mood: "SLOW DOWN", photo: "photo-1500534623283-312aade485b7", tone: "blue" },
  { title: "The plot twist", subtitle: "New chapter, same unstoppable you.", mood: "FRESH START", photo: "photo-1464822759023-fed622ff2c3b", tone: "pink" },
];

export default function Recommendations({ onChoose }) {
  return (
    <section className="recommendations" id="discover">
      <div className="section-heading">
        <div><span className="eyebrow">MADE FOR YOUR MOMENT</span><h2>Soundtracks to explore</h2></div>
        <button type="button" className="text-button all-mixes">All soundtracks <ArrowRight size={14} /></button>
      </div>
      <div className="recommendation-grid">
        {recommendations.map((item, index) => (
          <button className={`recommendation-card ${item.tone}`} type="button" key={item.title} onClick={() => onChoose(index)}>
            <img src={imageUrl(item.photo, 800)} alt="" />
            <span className="rec-gradient" />
            <span className="rec-top"><span><Headphones size={12} /> {item.mood}</span><span className="rec-number">0{index + 1}</span></span>
            <span className="rec-bottom"><strong>{item.title}</strong><small>{item.subtitle}</small><span className="rec-action">Explore <ArrowRight size={13} /></span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
