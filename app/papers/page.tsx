"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Paper = { arxiv_id: string; title: string; authors: string; year: number; abstract: string; pdf_url: string };

function PaperModal({ paper, onClose }: { paper: Paper; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center",
        justifyContent: "center", background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)", padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#0d0d0d", border: "1px solid rgba(255,106,0,0.22)", borderRadius: 20,
          padding: "36px", maxWidth: 580, width: "100%", position: "relative",
          boxShadow: "0 40px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03) inset",
          maxHeight: "85vh", overflowY: "auto" }}>
        <button onClick={onClose}
          style={{ position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, width: 34, height: 34,
            cursor: "pointer", color: "rgba(255,255,255,0.55)", fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}>✕</button>

        <div style={{ fontSize: 10, color: "#FF6A00", fontWeight: 700, letterSpacing: "0.14em", marginBottom: 14 }}>
          {paper.year}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 12, paddingRight: 44 }}>
          {paper.title}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 22 }}>{paper.authors}</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.78, marginBottom: 30 }}>
          {paper.abstract}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 11,
            background: "#FF6A00", color: "#000", fontSize: 13, fontWeight: 700, textDecoration: "none",
            transition: "opacity 0.15s, transform 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}>
            View PDF ↗
          </a>
          <a href={`https://arxiv.org/abs/${paper.arxiv_id}`} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 11,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
            color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
            transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
            View on arXiv ↗
          </a>
          <Link href="/chat" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 11,
            background: "rgba(255,106,0,0.08)", border: "1px solid rgba(255,106,0,0.2)",
            color: "#FF6A00", fontSize: 13, fontWeight: 600, textDecoration: "none",
            transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,106,0,0.14)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,106,0,0.08)"}>
            Ask about this paper →
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selected, setSelected] = useState<Paper | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/papers`)
      .then(r => r.json())
      .then(d => { setPapers(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = papers.filter(p =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.authors.toLowerCase().includes(search.toLowerCase()) ||
    String(p.year).includes(search)
  );

  return (
    <div style={{ background: "#050505", minHeight: "100vh" }}>
      <Navbar />

      <section style={{ padding: "100px clamp(16px,8vw,80px) 60px" }}>
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.22em", color: "#FF6A00", fontWeight: 700, marginBottom: 14 }}>
            CURATED INTELLIGENCE
          </div>
          <h1 style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, color: "#fff",
            letterSpacing: "-0.032em", lineHeight: 1.0, marginBottom: 16 }}>
            Papers <span style={{ color: "#FF6A00" }}>Library</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", marginBottom: 40, maxWidth: 520 }}>
            18 curated research papers shaping the future of Retrieval-Augmented Generation.
          </p>

          {/* search */}
          <div style={{ position: "relative", maxWidth: 480, marginBottom: 48 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}>
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or year..."
              style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: 12,
                background: "#111", border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit",
                transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "rgba(255,106,0,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
          </div>
        </motion.div>

        {/* papers grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ height: 200, borderRadius: 14, background: "#111",
                animation: "pulse 2s ease-in-out infinite" }} />
            ))}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>
              Showing {filtered.length} of {papers.length} papers
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {filtered.map((p, i) => (
                <motion.div key={p.arxiv_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  onClick={() => setSelected(p)}
                  style={{ padding: "22px", borderRadius: 14, background: "#111", cursor: "pointer",
                    border: "1px solid rgba(255,255,255,0.07)",
                    transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(255,106,0,0.32)";
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 20px 48px rgba(255,106,0,0.09)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 6,
                      background: "rgba(255,106,0,0.1)", color: "#FF6A00", fontWeight: 700 }}>{p.year}</span>
                    <a href={`https://arxiv.org/abs/${p.arxiv_id}`} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", textDecoration: "none" }}>
                      arXiv ↗
                    </a>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 10,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>{p.authors}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", lineHeight: 1.65, marginBottom: 16,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.abstract}
                  </div>
                  <div style={{ fontSize: 12, color: "#FF6A00", fontWeight: 600 }}>View Paper →</div>
                </motion.div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.25)", fontSize: 15 }}>
                No papers found for "{search}"
              </div>
            )}
          </>
        )}
      </section>

      <footer style={{ padding: "24px clamp(16px,8vw,80px)", borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 12, color: "#2a2a2a" }}>RAG Research Studio · Priyanka Narang</span>
        <span style={{ fontSize: 12, color: "#2a2a2a" }}>18 Curated Papers · Hybrid Retrieval</span>
      </footer>

      <AnimatePresence>
        {selected && <PaperModal paper={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
