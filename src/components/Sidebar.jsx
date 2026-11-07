import { Compass, Headphones, History, Settings2 } from "lucide-react";
import Brand from "./Brand.jsx";

const links = [
  { label: "Discover", icon: Compass, href: "#discover", active: true },
  { label: "Your moments", icon: History, href: "#moments" },
  { label: "Your music", icon: Headphones, href: "#music" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Brand />
      <div className="sidebar-section-label">YOUR SPACE</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {links.map(({ label, icon: Icon, href, active }) => (
          <a className={`nav-link ${active ? "active" : ""}`} href={href} key={label}>
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            {active && <span className="nav-active-dot" />}
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <div className="note-glow">✦</div>
          <p>Every feeling has a frequency.</p>
          <span>We’ll help you find yours.</span>
        </div>
        <button className="nav-link settings-link" type="button">
          <Settings2 size={18} strokeWidth={1.8} />
          <span>Settings</span>
        </button>
        <div className="profile">
          <div className="avatar">A</div>
          <div className="profile-copy"><strong>Alex Morgan</strong><span>Free listener</span></div>
          <span className="profile-menu">···</span>
        </div>
      </div>
    </aside>
  );
}
