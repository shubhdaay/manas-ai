import { useState, useRef, useEffect } from "react";
import "./App.css";

const MOODS = [
  { emoji: "😔", label: "Sad", color: "#7BA7CC" },
  { emoji: "😰", label: "Anxious", color: "#C4A882" },
  { emoji: "😤", label: "Frustrated", color: "#CC8080" },
  { emoji: "😶", label: "Numb", color: "#9B9BB4" },
  { emoji: "🙂", label: "Okay", color: "#7EBF9A" },
  { emoji: "😊", label: "Good", color: "#A8C97A" },
];

const BREATHING = {
  steps: ["Breathe in...", "Hold...", "Breathe out...", "Hold..."],
  durations: [4, 4, 6, 2],
};

function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | mood | chat
  const [name, setName] = useState("");
  const [mood, setMood] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathStep, setBreathStep] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [nameInput, setNameInput] = useState("");

  const messagesEndRef = useRef(null);
  const breathInterval = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startBreathing = () => {
    setBreathing(true);
    setBreathStep(0);
    setBreathProgress(0);
    let step = 0;
    let progress = 0;
    const tick = () => {
      progress += 100 / (BREATHING.durations[step] * 10);
      if (progress >= 100) {
        progress = 0;
        step = (step + 1) % 4;
        setBreathStep(step);
      }
      setBreathProgress(Math.min(progress, 100));
    };
    breathInterval.current = setInterval(tick, 100);
    setTimeout(() => {
      clearInterval(breathInterval.current);
      setBreathing(false);
    }, 60000);
  };

  const stopBreathing = () => {
    clearInterval(breathInterval.current);
    setBreathing(false);
  };

  const handleStart = () => {
    if (!nameInput.trim()) return;
    setName(nameInput.trim().split(" ")[0]);
    setScreen("mood");
  };

  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood);
    setScreen("chat");
    const opening = `${nameInput.trim().split(" ")[0]}, it's really good that you're here. I see you're feeling ${selectedMood.label.toLowerCase()} today. That's okay — you don't have to carry that alone. What's on your mind?`;
    setMessages([{ role: "assistant", content: opening }]);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      const reply = data.content || "I'm here. Take your time.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "I'm still here. Something went quiet for a moment — want to try again?" }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (breathing) return (
    <div className="breathing-container">
      <div className="breath-circle">
        <div className="breath-ring-bg" />
        <div
          className="breath-ring-progress"
          style={{ background: `conic-gradient(var(--accent) ${breathProgress * 3.6}deg, transparent 0deg)` }}
        />
        <div className="breath-inner">
          <div className="breath-step-label">{BREATHING.steps[breathStep]}</div>
          <div className="breath-counter">{BREATHING.durations[breathStep]}</div>
        </div>
      </div>
      <p className="breath-info">Box breathing — used by everyone from Navy SEALs to meditators.</p>
      <button onClick={stopBreathing} className="secondary-btn">Stop & Return to Chat</button>
    </div>
  );

  if (screen === "welcome") return (
    <div className="screen-center">
      <div className="orb-bg" />
      <div className="welcome-content fade-up">
        <div className="hero-emoji">🌿</div>
        <h1 className="hero-title">Manas</h1>
        <p className="hero-subtitle">मन • Mind • Space to Breathe</p>
        <p className="hero-desc">
          A safe, judgment-free space. Whatever you're carrying — you don't have to carry it alone.
        </p>

        <div className="input-group">
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleStart()}
            placeholder="What's your name?"
            className="main-input"
            autoFocus
          />
        </div>

        <button onClick={handleStart} className="primary-btn">I'm ready to talk →</button>

        <p className="legal-disclaimer">
          Your conversations are private. Manas is not a replacement for professional help.<br />
          Crisis helpline: iCall — 9152987821
        </p>
      </div>
    </div>
  );

  if (screen === "mood") return (
    <div className="screen-center">
      <div className="mood-content fade-up">
        <p className="screen-label">WELCOME, {name.toUpperCase()}</p>
        <h2 className="screen-title">How are you feeling right now?</h2>
        <p className="screen-desc">There's no wrong answer here.</p>
        <div className="mood-grid">
          {MOODS.map((m) => (
            <button key={m.label} className="mood-card" onClick={() => handleMoodSelect(m)}>
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="chat-layout">
      {/* Header */}
      <header className="chat-header">
        <div className="header-brand">
          <span className="header-logo">🌿</span>
          <div>
            <div className="header-name">Manas</div>
            <div className="header-status">● here with you</div>
          </div>
        </div>
        <div className="header-actions">
          {mood && (
            <span className="mood-badge">{mood.emoji} {mood.label}</span>
          )}
          <button className="breathe-nav-btn" onClick={startBreathing}>🫁 Breathe</button>
        </div>
      </header>

      {/* Messages */}
      <main className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role === 'user' ? 'msg-user' : 'msg-bot'}`}>
            {msg.role === "assistant" && <div className="bot-avatar">🌿</div>}
            <div className="msg-bubble">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="msg-row msg-bot">
            <div className="bot-avatar">🌿</div>
            <div className="msg-bubble loading-bubble">
              {[0, 1, 2].map(i => <div key={i} className="dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="chat-input-area">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Talk to me, ${name}... I'm listening.`}
            rows={1}
            className="chat-textarea"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`send-btn ${input.trim() ? 'active' : ''}`}
          >→</button>
        </div>
        <p className="crisis-note">Crisis support: iCall 9152987821 · Vandrevala Foundation 1860-2662-345</p>
      </footer>
    </div>
  );
}

export default App;
