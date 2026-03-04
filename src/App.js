import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";
import { useNavigate, useLocation } from "react-router-dom";

import englishFacts from "./Facts/englishFacts";
import hindiFacts from "./Facts/hindiFacts";

import englishCurrentAffairs from "./CurrentAffairs/englishCurrentAffairs";
import hindiCurrentAffairs from "./CurrentAffairs/hindiCurrentAffairs";

import boxClosed from "./assets/close.png";
import boxOpen from "./assets/open.png";
import royalPad from "./assets/royalpad.png";
import bellSound from "./assets/bell.wav";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [fact, setFact] = useState("");
  const [loading, setLoading] = useState(false);
  const lastTap = useRef(0);
  const audioRef = useRef(new Audio(bellSound));
  const [language, setLanguage] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ mode: "facts" | "ca"
  const [mode, setMode] = useState(() => {
    const p = window.location.pathname.toLowerCase();
    if (p.startsWith("/current-affairs")) return "ca";
    return "facts";
  });
  /* ✅ URL -> MODE sync (direct open + back/forward) */
  useEffect(() => {
    const p = (location.pathname || "").toLowerCase();

    // default route
    if (p === "/" || p === "") {
      navigate("/facts", { replace: true });
      return;
    }

    let nextMode = "facts";
    if (p.startsWith("/current-affairs")) nextMode = "ca";
    if (p.startsWith("/facts")) nextMode = "facts";

    // unknown routes -> facts
    if (!p.startsWith("/facts") && !p.startsWith("/current-affairs")) {
      navigate("/facts", { replace: true });
      return;
    }

    if (nextMode !== mode) {
      setMode(nextMode);
      setIsOpen(false);
      setFact("");
    }
    // ✅ intentionally NOT adding `mode` in dependency to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navigate]);

  /* ===== DOUBLE TAP LOGIC ===== */
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      openChest();
    }
    lastTap.current = now;
  };

  /* ===== FETCH VALID CONTENT (MAX 200 chars) ===== */
  const fetchValidContent = useCallback(() => {
    const MAX_LENGTH = 200;

    const dataArray =
      mode === "ca"
        ? language === "hi"
          ? hindiCurrentAffairs
          : englishCurrentAffairs
        : language === "hi"
          ? hindiFacts
          : englishFacts;

    const valid = (dataArray || []).filter((t) => (t || "").length <= MAX_LENGTH);

    if (valid.length === 0) {
      if (mode === "ca") {
        return language === "hi"
          ? "वर्तमान घटनाएँ अपडेट हो रही हैं 👑"
          : "Current affairs are updating 👑";
      }
      return language === "hi"
        ? "शाही संग्रह अपडेट हो रहा है 👑"
        : "Royal archives are currently updating 👑";
    }

    return valid[Math.floor(Math.random() * valid.length)];
  }, [language, mode]);

  /* ===== OPEN CHEST ===== */
  const openChest = () => {
    setLoading(true);
    setIsOpen(true);
    audioRef.current.currentTime = 0;
    audioRef.current.play();

    try {
      const newText = fetchValidContent();
      setFact(newText);
    } catch (error) {
      setFact(
        language === "hi"
          ? "ज्ञान बुलाने में समस्या हुई 👑"
          : "Failed to summon royal knowledge 👑"
      );
    }

    setLoading(false);
  };

  /* ===== PRELOAD IMAGES ===== */
  useEffect(() => {
    const images = [boxClosed, boxOpen, royalPad];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  /* ===== CLOSE BOX ===== */
  const reset = () => {
    setIsOpen(false);
    setFact("");
  };

  /* ===== AUTO UPDATE TEXT ON LANGUAGE/MODE CHANGE (IF OPEN) ===== */
  useEffect(() => {
    if (isOpen) {
      const newText = fetchValidContent();
      setFact(newText);
    }
  }, [language, mode, isOpen, fetchValidContent]);

  // ✅ category button click (also updates URL)
  const goToMode = (nextMode) => {
    if (nextMode === mode) return;

    setMode(nextMode);
    setIsOpen(false);
    setFact("");

    navigate(nextMode === "ca" ? "/current-affairs" : "/facts");
  };

  const title = mode === "ca" ? "Current Affairs Game" : "Facts Game";

  return (
    <div className="container">
      <h1 className="game-title">{title}</h1>
      <div className="title-divider" />

      {/* ✅ Category Pill */}
      <div className="category-wrap">
        <button
          type="button"
          className="category-pill"
          onClick={() => goToMode(mode === "facts" ? "ca" : "facts")}
        >
          <span className="pill-icon">⦿</span>{" "}
          {mode === "facts" ? "CURRENT AFFAIRS" : "FACTS"}
        </button>
      </div>

      {/* ===== LANGUAGE DROPDOWN ===== */}
      <div className="language-menu">
        <div
          className={`selected-language ${isLangOpen ? "active" : ""}`}
          onClick={() => setIsLangOpen(!isLangOpen)}
        >
          {language === "en" ? "English" : "हिंदी"}
        </div>

        <div className={`language-options ${isLangOpen ? "show" : ""}`}>
          <p
            onClick={() => {
              setLanguage("en");
              setIsLangOpen(false);
            }}
          >
            English
          </p>
          <p
            onClick={() => {
              setLanguage("hi");
              setIsLangOpen(false);
            }}
          >
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
              <h2>{mode === "ca" ? "Royal Current Affairs" : "Royal Knowledge"}</h2>
              <p>{loading ? "Summoning knowledge..." : fact}</p>
              <button onClick={reset}>Close Box</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}