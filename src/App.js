import { useState, useRef, useEffect } from "react";
import "./App.css";
import englishFacts from "./englishFacts";
import hindiFacts from "./hindiFacts";

import boxClosed from "./assets/close.png";
import boxOpen from "./assets/open.png";
import royalPad from "./assets/royalpad.png";
import bellSound from "./assets/bell.wav";

/* ===== MULTIPLE FACT APIs ===== */
// const apis = [
//   "https://f-api.ir/api/facts/random",
//   "https://uselessfacts.jsph.pl/random.json?language=en",
//   "https://meowfacts.herokuapp.com/"
// ];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [fact, setFact] = useState("");
  const [loading, setLoading] = useState(false);
  const lastTap = useRef(0);
  const audioRef = useRef(new Audio(bellSound));
  const [language, setLanguage] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);

  /* ===== DOUBLE TAP LOGIC ===== */
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      openChest();
    }
    lastTap.current = now;
  };

  /* ===== FETCH VALID FACT (MAX 3 LINES APPROX) ===== */
  const fetchValidFact = () => {
    const MAX_LENGTH = 200;

    const factsArray =
      language === "hi" ? hindiFacts : englishFacts;

    const validFacts = factsArray.filter(
      (fact) => fact.length <= MAX_LENGTH
    );

    if (validFacts.length === 0) {
      return language === "hi"
        ? "शाही संग्रह अपडेट हो रहा है 👑"
        : "Royal archives are currently updating 👑";
    }

    return validFacts[
      Math.floor(Math.random() * validFacts.length)
    ];
  };

  /* ===== OPEN CHEST ===== */
  const openChest = () => {
    setLoading(true);
    setIsOpen(true);
    audioRef.current.currentTime = 0; // restart sound if already played
    audioRef.current.play();

    try {
      const newFact = fetchValidFact();
      setFact(newFact);
    } catch (error) {
      setFact("Failed to summon royal knowledge 👑");
    }

    setLoading(false);
  };

  /* ===== REFRESH (CLOSE BOX FIRST) ===== */
  const reset = () => {
    setIsOpen(false);
    setFact("");
  };

  /* ===== AUTO UPDATE FACT ON LANGUAGE CHANGE ===== */
 useEffect(() => {
  if (isOpen) {
    const newFact = fetchValidFact();
    setFact(newFact);
  }
}, [language, isOpen]);

  return (
    <div className="container">
    <h1 className="game-title">Facts Game</h1>
      {/* ===== LANGUAGE DROPDOWN ===== */}
      <div className="language-menu">
        <div
          className={`selected-language ${isLangOpen ? "active" : ""}`}
          onClick={() => setIsLangOpen(!isLangOpen)}
        >
          {language === "en" ? "English" : "हिंदी"} ▼
        </div>

        <div className={`language-options ${isLangOpen ? "show" : ""}`}>
          <p onClick={() => { setLanguage("en"); setIsLangOpen(false); }}>
            English
          </p>
          <p onClick={() => { setLanguage("hi"); setIsLangOpen(false); }}>
            हिंदी
          </p>
        </div>
      </div>
      {!isOpen ? (
        <div className="chest" onClick={handleTap}>
          <img src={boxClosed} alt="Closed Chest" className="chest-img" />
          <p className="hint">Double Tap to Open</p>
        </div>
      ) : (
        <div className="open-section">
          <img src={boxOpen} alt="Open Chest" className="open-img" />

          <div className="royal-pad">
            <img src={royalPad} alt="Royal Letter" className="pad-img" />

            <div className="pad-text">
              <h2>📜 Royal Knowledge</h2>
              <p>{loading ? "Summoning knowledge..." : fact}</p>
              <button onClick={reset}>
                Close Chest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}