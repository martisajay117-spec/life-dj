import { AudioLines } from "lucide-react";

export default function Brand() {
  return (
    <a className="brand" href="#home" aria-label="LIFE DJ home">
      <span className="brand-mark">
        <AudioLines size={19} strokeWidth={2.2} />
      </span>
      <span className="brand-word">LIFE<span>DJ</span></span>
    </a>
  );
}
