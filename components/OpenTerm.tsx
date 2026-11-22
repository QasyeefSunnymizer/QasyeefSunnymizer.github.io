"use client";

export default function OpenTerm() {
  return (
    <button className="linkbtn" onClick={() => window.dispatchEvent(new Event("open-terminal"))}>
      open the terminal
    </button>
  );
}
