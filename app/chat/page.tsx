"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Citation = {
  chunk_id: string; arxiv_id: string; text_preview: string;
  paper_title: string; authors: string; year: number;
};

type Message = {
  id: string; role: "user" | "assistant";
  content: string; citations?: Citation[];
  latencies?: Record<string, number>; cost?: number;
  loading?: boolean; key_takeaways?: string[];
};

const STEPS = [
  "Searching Research Papers...",
  "Finding Relevant Documents...",
  "Extracting Chunks...",
  "Building Context...",
  "Generating Grounded Answer...",
  "Verifying Citations...",
];

const SUGGESTED = [
  "What is retrieval-augmented generation?",
  "How does Self-RAG decide when to retrieve?",
  "How does RAPTOR differ from flat chunking?",
  "What evaluation metrics does RAGAS use?",
];

function RetrievalAnimation({ step }: { step: number }) {
  return (
    <div style={{ padding: "20px 0" }}>
      {STEPS.map((s, i) => (
        <motion.div key={s}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: i <= step ? 1 : 0.25, x: 0 }}
          transition={{ delay: i * 0.18, duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
            background: i < step ? "#FF6A00" : i === step ? "transparent" : "rgba(255,255,255,0.06)",
            border: i === step ? "2px solid #FF6A00" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {i < step && <span style={{ fontSize: 10, color: "#000", fontWeight: 700 }}>✓</span>}
            {i === step && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ width: 8, height: 8, borderRadius: "50%", borderTop: "2px solid #FF6A00",
                  borderRight: "2px solid transparent" }} />
            )}
          </div>
          <span style={{ fontSize: 13, color: i <= step ? "#fff" : "rgba(255,255,255,0.25)",
            fontWeight: i === step ? 600 : 400 }}>{s}</span>
        </motion.div>
      ))}
    </div>
  );
}

function CitationCard({ c }: { c: Citation }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "#0e0e0e", border: "1px solid rgba(255,106,0,0.18)", borderRadius: 12,
      padding: "14px", marginBottom: 8, cursor: "pointer", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,106,0,0.35)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,106,0,0.18)"}
      onClick={() => setExpanded(!expanded)}>
      <div style={{ fontSize: 9, color: "#FF6A00", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>
        {c.year} · {c.authors}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", lineHeight: 1.4, marginBottom: expanded ? 10 : 0,
        display: expanded ? "block" : "-webkit-box",
        // @ts-ignore
        WebkitLineClamp: expanded ? "unset" : 2,
        WebkitBoxOrient: "vertical", overflow: expanded ? "visible" : "hidden" }}>
        {c.paper_title}
      </div>
      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 10,
            borderLeft: "2px solid rgba(255,106,0,0.4)", paddingLeft: 10, fontStyle: "italic" }}>
            "{c.text_preview}"
          </p>
          <a href={`https://arxiv.org/abs/${c.arxiv_id}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 10, color: "#FF6A00", textDecoration: "none", fontWeight: 600 }}
            onClick={e => e.stopPropagation()}>
            View on arXiv ↗
          </a>
        </motion.div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, step]);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStep(0);

    // animate through retrieval steps
    for (let i = 1; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 700));
      setStep(i);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer, key_takeaways: data.key_takeaways || [], citations: Array.from(new Map<string, Citation>((data.citations || []).map((c: Citation) => [c.chunk_id, c] as [string, Citation])).values()),
        latencies: data.latencies_ms,
        cost: data.cost_usd,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: "Failed to connect to the research backend. Please try again.",
      }]);
    } finally {
      setLoading(false);
      setStep(-1);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");

  return (
    <div style={{ background: "#050505", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* top bar */}
      <div style={{ height: 56, borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(12px, 3vw, 24px)", background: "rgba(5,5,5,0.95)", backdropFilter: "blur(20px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "#FF6A00",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 5.5h9M5.5 1l4.5 4.5L5.5 10" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>RAG Studio</span>
        </Link>
        <span className="chat-topbar-meta" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          18 papers · hybrid retrieval · citation enforcement
        </span>
        <Link href="/papers" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none",
          transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
          Browse Papers →
        </Link>
      </div>

      {/* three columns */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT — history */}
        <div className="chat-sidebar-left" style={{ width: 240, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column", background: "#080808", overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 10px", fontSize: 10, color: "rgba(255,255,255,0.25)",
            fontWeight: 700, letterSpacing: "0.12em" }}>HISTORY</div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
            {messages.filter(m => m.role === "user").length === 0 ? (
              <div style={{ padding: "8px", fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
                Your questions will appear here.
              </div>
            ) : (
              messages.filter(m => m.role === "user").map(m => (
                <div key={m.id} style={{ padding: "10px 10px", borderRadius: 8, marginBottom: 4,
                  background: "rgba(255,255,255,0.03)", cursor: "default",
                  fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  {m.content.length > 60 ? m.content.slice(0, 60) + "..." : m.content}
                </div>
              ))
            )}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button onClick={() => { setMessages([]); setInput(""); }}
              style={{ width: "100%", padding: "9px", borderRadius: 8, background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)",
                fontSize: 12, cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
              Clear History
            </button>
          </div>
        </div>

        {/* CENTER — chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "24px clamp(16px,4vw,48px)" }}>

            {messages.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", paddingTop: "10vh" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 12 }}>
                  Ask anything about <span style={{ color: "#FF6A00" }}>RAG</span>
                </div>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", marginBottom: 40, lineHeight: 1.65 }}>
                  Grounded answers from 18 curated research papers with verified citations.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 540, margin: "0 auto" }}>
                  {SUGGESTED.map(q => (
                    <button key={q} onClick={() => send(q)} style={{
                      padding: "14px 16px", borderRadius: 12, background: "#111",
                      border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)",
                      fontSize: 13, textAlign: "left", cursor: "pointer", lineHeight: 1.5,
                      transition: "border-color 0.2s, color 0.2s, transform 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,106,0,0.3)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 28 }}>
                  {m.role === "user" ? (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ maxWidth: "72%", padding: "12px 18px", borderRadius: 14,
                        background: "#FF6A00", color: "#000", fontSize: 14, fontWeight: 600, lineHeight: 1.55 }}>
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,106,0,0.15)",
                        border: "1px solid rgba(255,106,0,0.3)", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: "#FF6A00" }}>✦</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.78,
                          whiteSpace: "pre-wrap", marginBottom: m.citations?.length ? 20 : 0 }}>
                          {m.content}
                        </div>
                        {m.citations && m.citations.length > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 10, color: "#FF6A00", fontWeight: 700,
                              letterSpacing: "0.12em", marginBottom: 10 }}>SOURCES USED</div>
                            {m.citations.map((c, i) => <CitationCard key={`${c.chunk_id}-${i}`} c={c} />)}
                          </div>
                        )}
                        {m.key_takeaways && m.key_takeaways.length > 0 && (
                          <div style={{ marginTop:16, padding:"14px 16px", borderRadius:12,
                            background:"rgba(255,106,0,0.05)", border:"1px solid rgba(255,106,0,0.15)" }}>
                            <div style={{ fontSize:10, color:"#FF6A00", fontWeight:700, letterSpacing:"0.12em", marginBottom:10 }}>KEY TAKEAWAYS</div>
                            {m.key_takeaways.map((t,i) => (
                              <div key={i} style={{ display:"flex", gap:8, marginBottom:6, fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.55 }}>
                                <span style={{ color:"#FF6A00", flexShrink:0 }}>•</span>
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {m.latencies && (
                          <div style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.2)",
                            display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <span>embed {m.latencies.embed_ms}ms</span>
                            <span>rerank {m.latencies.rerank_ms}ms</span>
                            <span>llm {m.latencies.llm_ms}ms</span>
                            <span>total {m.latencies.total_ms}ms</span>
                            {m.cost && <span>${m.cost}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,106,0,0.15)",
                  border: "1px solid rgba(255,106,0,0.3)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#FF6A00" }}>✦</div>
                <div style={{ flex: 1 }}>
                  <RetrievalAnimation step={step} />
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* input bar */}
          <div style={{ padding: "16px clamp(16px,4vw,48px) 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(5,5,5,0.95)", backdropFilter: "blur(20px)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end",
              background: "#111", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 14, padding: "12px 14px",
              transition: "border-color 0.2s" }}
              onFocus={() => {}} >
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey} placeholder="Ask anything about RAG research..."
                rows={1} disabled={loading}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#fff", fontSize: 14, lineHeight: 1.6, resize: "none",
                  fontFamily: "inherit", maxHeight: 120, overflowY: "auto" }} />
              <button onClick={() => send(input)} disabled={loading || !input.trim()}
                style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: input.trim() && !loading ? "#FF6A00" : "rgba(255,255,255,0.06)",
                  border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s, transform 0.15s" }}
                onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke={input.trim() && !loading ? "#000" : "rgba(255,255,255,0.3)"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", marginTop: 8, textAlign: "center" }}>
              Grounded answers from 18 curated RAG research papers · Citations verified in code
            </p>
          </div>
        </div>

        {/* RIGHT — sources */}
        <div className="chat-sidebar-right" style={{ width: 280, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column", background: "#080808", overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 10px", fontSize: 10, color: "rgba(255,255,255,0.25)",
            fontWeight: 700, letterSpacing: "0.12em" }}>RETRIEVED SOURCES</div>
          <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px" }}>
            {!lastAssistant?.citations?.length ? (
              <div style={{ padding: "8px 4px", fontSize: 12, color: "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
                Sources from your last query will appear here with expandable excerpts.
              </div>
            ) : (
              lastAssistant.citations.map((c, i) => <CitationCard key={`${c.chunk_id}-${i}`} c={c} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}









