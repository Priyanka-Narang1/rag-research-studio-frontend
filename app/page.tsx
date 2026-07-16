"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";

type Paper = { arxiv_id: string; title: string; authors: string; year: number; abstract: string; pdf_url: string };

const PIPELINE = [
  { n:"01", icon:"💬", title:"Ask Question",     desc:"You ask anything in natural language about RAG or retrieval methods." },
  { n:"02", icon:"🔍", title:"Retrieve Papers",  desc:"Hybrid BM25 + vector search runs across 602 chunks from 18 papers." },
  { n:"03", icon:"⚡", title:"Extract Chunks",   desc:"Cross-encoder reranker scores every candidate for true relevance." },
  { n:"04", icon:"✨", title:"Generate Answer",  desc:"LLM synthesises a grounded answer using only retrieved context." },
  { n:"05", icon:"✓",  title:"Return Citations", desc:"Answer returned with verified citations — hallucinated IDs flagged in code." },
];

const FEATURES = [
  { icon:"◎", title:"Semantic Search",   desc:"Advanced embeddings power precise retrieval across 18 research papers." },
  { icon:"✦", title:"Grounded Answers",  desc:"Answers generated using verified context from real papers only." },
  { icon:"⊞", title:"Real Citations",    desc:"Citations with paper links so you can trust and explore further." },
  { icon:"⚡", title:"Fast & Reliable",  desc:"Optimised hybrid retrieval pipeline for speed and accuracy." },
];

const LEFT_CARDS  = [0, 2, 4];
const RIGHT_CARDS = [1, 3, 5];

const CARD_POS = [
  { top:"8%",  side:"left",  rot:"-11deg", delay:0,    speed:"8s",  anim:"float-a" },
  { top:"6%",  side:"right", rot:"9deg",   delay:"1.3s",speed:"10s", anim:"float-b" },
  { top:"40%", side:"left",  rot:"-6deg",  delay:"0.6s",speed:"7s",  anim:"float-c" },
  { top:"38%", side:"right", rot:"13deg",  delay:"2s",  speed:"9s",  anim:"float-a" },
  { top:"70%", side:"left",  rot:"-9deg",  delay:"0.3s",speed:"11s", anim:"float-b" },
  { top:"68%", side:"right", rot:"7deg",   delay:"1.7s",speed:"8s",  anim:"float-c" },
];

function GlassCard({ paper, pos, mouseX, mouseY, index }: {
  paper: Paper; pos: typeof CARD_POS[0]; mouseX: number; mouseY: number; index: number;
}) {
  const px = (mouseX - 0.5) * (index % 2 === 0 ? -9 : 9);
  const py = (mouseY - 0.5) * -6;
  const sideVal = pos.side === "left" ? { left: "clamp(4px, 2vw, 24px)" } : { right: "clamp(4px, 2vw, 24px)" };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: typeof pos.delay === "number" ? pos.delay : parseFloat(String(pos.delay)), duration: 0.9, ease: [0.16,1,0.3,1] }}
      style={{
        position: "absolute", top: pos.top, width: "clamp(150px, 14vw, 210px)",
        ...sideVal, zIndex: 2, pointerEvents: "none",
        translateX: px, translateY: py,
        animation: `${pos.anim} ${pos.speed} ${pos.delay} ease-in-out infinite`,
        transform: `rotate(${pos.rot})`,
      }}>
      <div style={{
        padding: "16px 14px", borderRadius: 14,
        background: "rgba(18,18,18,0.55)",
        border: "1px solid rgba(255,106,0,0.28)",
        backdropFilter: "blur(18px) saturate(160%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 48px rgba(0,0,0,0.55), 0 0 32px rgba(255,106,0,0.07)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg, transparent, rgba(255,106,0,0.7), transparent)" }} />
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"45%",
          background:"linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 100%)",
          borderRadius:"14px 14px 0 0", pointerEvents:"none" }} />
        <div style={{ fontSize:9, color:"#FF6A00", fontWeight:700, letterSpacing:"0.12em", marginBottom:9 }}>{paper.year}</div>
        <div style={{ fontSize:11, color:"#fff", fontWeight:600, lineHeight:1.48, marginBottom:7,
          display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{paper.title}</div>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.32)" }}>{paper.authors}</div>
      </div>
    </motion.div>
  );
}

function PaperModal({ paper, onClose }: { paper: Paper; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center",
        background:"rgba(0,0,0,0.82)", backdropFilter:"blur(14px)", padding:20 }}
      onClick={onClose}>
      <motion.div initial={{ scale:0.91, y:28 }} animate={{ scale:1, y:0 }} exit={{ scale:0.91 }}
        transition={{ type:"spring", stiffness:280, damping:26 }}
        onClick={e=>e.stopPropagation()}
        className="paper-modal-inner"
        style={{ background:"#0d0d0d", border:"1px solid rgba(255,106,0,0.22)", borderRadius:20,
          padding:"36px", maxWidth:560, width:"100%", position:"relative",
          boxShadow:"0 40px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03) inset" }}>
        <button onClick={onClose} style={{ position:"absolute", top:18, right:18, background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, width:34, height:34,
          cursor:"pointer", color:"rgba(255,255,255,0.55)", fontSize:15,
          display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>✕</button>
        <div style={{ fontSize:10, color:"#FF6A00", fontWeight:700, letterSpacing:"0.14em", marginBottom:14 }}>{paper.year}</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", lineHeight:1.25, marginBottom:12, paddingRight:44 }}>{paper.title}</h2>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginBottom:22 }}>{paper.authors}</p>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.62)", lineHeight:1.78, marginBottom:30 }}>{paper.abstract}</p>
        <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={{
          display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:11,
          background:"#FF6A00", color:"#000", fontSize:13, fontWeight:700, textDecoration:"none",
          transition:"opacity 0.15s, transform 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="scale(1.03)";}}
          onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="scale(1)";}}>
          View Original PDF ↗
        </a>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [mouse, setMouse] = useState({ x:0.5, y:0.5 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset:["start start","end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY      = useTransform(scrollYProgress, [0, 1],   [0, -100]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/papers`)
      .then(r=>r.json()).then(setPapers).catch(()=>{});
    const fn = (e: MouseEvent) => setMouse({ x: e.clientX/window.innerWidth, y: e.clientY/window.innerHeight });
    window.addEventListener("mousemove", fn, { passive:true });
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <div style={{ background:"#050505", minHeight:"100vh" }}>
      <Navbar />

      {/* HERO */}
      <section ref={heroRef} style={{ position:"relative", height:"145vh", overflow:"hidden" }}>
        <div style={{ position:"sticky", top:0, height:"100vh",
          display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>

          {/* noise */}
          <div style={{ position:"absolute", inset:"-20%", zIndex:0, pointerEvents:"none", opacity:0.032,
            backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            animation:"noise 8s steps(1) infinite" }} />

          {/* grid */}
          <div style={{ position:"absolute", inset:0, zIndex:0, pointerEvents:"none", opacity:0.04,
            backgroundImage:"linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)",
            backgroundSize:"56px 56px" }} />

          {/* bottom glow */}
          <div style={{ position:"absolute", bottom:"-8%", left:"50%", transform:"translateX(-50%)",
            width:1000, height:420, borderRadius:"50%", pointerEvents:"none",
            background:"radial-gradient(ellipse, rgba(255,106,0,0.13) 0%, transparent 68%)",
            filter:"blur(70px)", zIndex:1 }} />

          {/* mouse glow */}
          <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
            background:`radial-gradient(700px circle at ${mouse.x*100}% ${mouse.y*100}%, rgba(255,106,0,0.07) 0%, transparent 60%)`,
            transition:"background 0.1s" }} />

          {/* floating paper cards — strictly sides */}
          <div className="hero-floating-cards" style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"none" }}>
{CARD_POS.map((pos, i) => {
              const paper = papers.length > 0 ? papers[i % papers.length] : {
                arxiv_id: String(i), title: ["Retrieval-Augmented Generation", "Dense Passage Retrieval", "Self-RAG", "RAPTOR", "ColBERT", "Corrective RAG"][i] || "Research Paper",
                authors: ["Lewis et al.", "Karpukhin et al.", "Asai et al.", "Sarthi et al.", "Khattab & Zaharia", "Yan et al."][i] || "Authors et al.",
                year: [2020, 2020, 2023, 2024, 2020, 2024][i] || 2024, abstract: "", pdf_url: ""
              };
              return <GlassCard key={i} paper={paper} pos={pos} mouseX={mouse.x} mouseY={mouse.y} index={i} />;
            })}
          </div>

          {/* hero text — center */}
          <motion.div className="hero-text-wrapper" style={{ y: heroY, opacity: heroOpacity,
            position:"relative", zIndex:3, textAlign:"center",
            padding:"0 clamp(60px,18vw,260px)", maxWidth:1100, width:"100%" }}>

            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:100,
                background:"rgba(255,106,0,0.08)", border:"1px solid rgba(255,106,0,0.22)",
                color:"#FF6A00", fontSize:10, fontWeight:700, letterSpacing:"0.16em", marginBottom:26 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"#FF6A00",
                display:"inline-block", animation:"pulse-glow 2s ease-in-out infinite" }} />
              AI POWERED RESEARCH ASSISTANT
            </motion.div>

            <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.72, delay:0.1 }}
              style={{ fontSize:"clamp(48px,8.5vw,108px)", fontWeight:800, lineHeight:0.97,
                letterSpacing:"-0.042em", marginBottom:22, color:"#fff" }}>
              Explore{" "}
              <span style={{ color:"#FF6A00" }}>Retrieval-<br />Augmented</span>{" "}
              Generation
            </motion.h1>

            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.36 }}
              style={{ fontSize:"clamp(15px,1.8vw,19px)", color:"rgba(255,255,255,0.48)",
                lineHeight:1.68, maxWidth:500, margin:"0 auto 36px" }}>
              Ask questions across curated research papers and receive grounded AI-powered answers with real citations.
            </motion.p>

            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
              style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
              <Link href="/chat" style={{
                display:"inline-flex", alignItems:"center", gap:10,
                padding:"14px 30px", borderRadius:12,
                background:"#FF6A00", color:"#000",
                fontSize:15, fontWeight:700, textDecoration:"none",
                transition:"transform 0.15s, box-shadow 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 10px 36px rgba(255,106,0,0.48)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none";}}>
                Start Research →
              </Link>
              <Link href="/papers" style={{
                display:"inline-flex", alignItems:"center", gap:10,
                padding:"14px 30px", borderRadius:12,
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
                color:"#fff", fontSize:15, fontWeight:600, textDecoration:"none",
                transition:"background 0.15s, transform 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.transform="scale(1.03)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.transform="scale(1)";}}>
                Browse Papers
              </Link>
            </motion.div>

            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.3 }}
              style={{ marginTop:52, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <div style={{ width:22, height:38, borderRadius:12, border:"1px solid rgba(255,255,255,0.1)",
                display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"5px 0" }}>
                <motion.div animate={{ y:[0,9,0] }} transition={{ repeat:Infinity, duration:1.9, ease:"easeInOut" }}
                  style={{ width:3, height:8, borderRadius:2, background:"#FF6A00" }} />
              </div>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.22)", letterSpacing:"0.1em" }}>SCROLL TO EXPLORE</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bridge section */}
      <div style={{ padding:"24px clamp(16px,8vw,80px)", display:"flex", alignItems:"center", gap:16,
        borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ height:1, flex:1, background:"linear-gradient(to right, transparent, rgba(255,106,0,0.2), transparent)" }} />
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.18)", letterSpacing:"0.18em", fontWeight:600, whiteSpace:"nowrap" }}>
          PRODUCTION · RAG · RESEARCH
        </span>
        <div style={{ height:1, flex:1, background:"linear-gradient(to right, transparent, rgba(255,106,0,0.2), transparent)" }} />
      </div>

      {/* STATS */}
      <section style={{ padding:"0 clamp(16px,8vw,80px) 60px" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="stats-grid"
          style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",
            gap:1, border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, overflow:"hidden" }}>
          {[{v:"18",l:"Research Papers"},{v:"602",l:"Knowledge Chunks"},{v:"Semantic",l:"Retrieval"},{v:"0",l:"Hallucinated Citations"}].map((s,i) => (
            <div key={s.l} style={{ padding:"32px 24px", background:"#0a0a0a", textAlign:"center",
              borderRight: i<3 ? "1px solid rgba(255,255,255,0.06)" : "none",
              transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#0e0e0e"}
              onMouseLeave={e=>e.currentTarget.style.background="#0a0a0a"}>
              <div style={{ fontSize:34, fontWeight:800, color:"#FF6A00", letterSpacing:"-0.02em", lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginTop:10, letterSpacing:"0.07em" }}>{s.l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:"60px clamp(16px,8vw,80px)" }}>
        <motion.div initial={{ opacity:0, y:22 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, letterSpacing:"0.24em", color:"#FF6A00", fontWeight:700, marginBottom:16 }}>HOW RAG WORKS</div>
          <h2 style={{ fontSize:"clamp(32px,5vw,62px)", fontWeight:800, color:"#fff",
            letterSpacing:"-0.028em", lineHeight:1.06 }}>
            From Question to <span style={{ color:"#FF6A00" }}>Accurate</span> Answer
          </h2>
        </motion.div>
        <div className="pipeline-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
          {PIPELINE.map((p,i) => (
            <motion.div key={p.n} initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.09 }} viewport={{ once:true }}
              style={{ padding:"28px 22px", background:"#111", borderRadius:14,
                border:"1px solid rgba(255,255,255,0.07)",
                transition:"border-color 0.22s, transform 0.22s, box-shadow 0.22s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,106,0,0.32)";e.currentTarget.style.transform="translateY(-6px) rotate(-0.5deg)";e.currentTarget.style.boxShadow="0 20px 48px rgba(255,106,0,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ fontSize:24, marginBottom:14 }}>{p.icon}</div>
              <div style={{ fontSize:11, color:"#FF6A00", fontWeight:700, letterSpacing:"0.14em", marginBottom:10 }}>{p.n}</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:10 }}>{p.title}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.72 }}>{p.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"0 clamp(16px,8vw,80px) 60px" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ fontSize:11, letterSpacing:"0.24em", color:"#FF6A00", fontWeight:700, marginBottom:16 }}>KEY FEATURES</div>
          <h2 style={{ fontSize:"clamp(28px,4vw,54px)", fontWeight:800, color:"#fff", letterSpacing:"-0.028em" }}>
            Built for production.
          </h2>
        </motion.div>
        <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
          {FEATURES.map((f,i) => (
            <motion.div key={f.title} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.08 }} viewport={{ once:true }}
              style={{ padding:"30px 24px", background:"#111", borderRadius:14,
                border:"1px solid rgba(255,255,255,0.07)",
                transition:"border-color 0.22s, transform 0.22s, box-shadow 0.22s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,106,0,0.32)";e.currentTarget.style.transform="translateY(-5px) rotate(0.3deg)";e.currentTarget.style.boxShadow="0 20px 48px rgba(255,106,0,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ fontSize:26, marginBottom:16, color:"#FF6A00" }}>{f.icon}</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:10 }}>{f.title}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.72 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PAPERS */}
      <section style={{ padding:"0 clamp(16px,8vw,80px) 60px" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="papers-header"
          style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40 }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:"0.24em", color:"#FF6A00", fontWeight:700, marginBottom:14 }}>CURATED RESEARCH PAPERS</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,52px)", fontWeight:800, color:"#fff", letterSpacing:"-0.028em" }}>
              A growing collection of <span style={{ color:"#FF6A00" }}>research on RAG.</span>
            </h2>
          </div>
          <Link href="/papers" style={{ fontSize:13, color:"rgba(255,255,255,0.3)", textDecoration:"none",
            display:"flex", alignItems:"center", gap:6, transition:"color 0.2s", whiteSpace:"nowrap" }}
            onMouseEnter={e=>e.currentTarget.style.color="#fff"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
            View All Papers →
          </Link>
        </motion.div>
        <div className="papers-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
          {(papers.length ? papers.slice(0,6) : Array.from({length:6},(_,i)=>({arxiv_id:String(i),title:"",authors:"",year:0,abstract:"",pdf_url:""}))).map((p,i) => (
            <motion.div key={p.arxiv_id} initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }}
              transition={{ delay:i*0.07 }} viewport={{ once:true }}
              onClick={() => p.title && setSelectedPaper(p)}
              style={{ padding:"22px", borderRadius:14, background:"#111", cursor:"pointer",
                border:"1px solid rgba(255,255,255,0.07)",
                transition:"border-color 0.22s, transform 0.22s, box-shadow 0.22s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,106,0,0.32)";e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow="0 20px 48px rgba(255,106,0,0.09)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
              {!p.title ? (
                <div style={{ height:155, background:"#0f0f0f", borderRadius:8 }} />
              ) : (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                    <span style={{ fontSize:10, padding:"3px 9px", borderRadius:6,
                      background:"rgba(255,106,0,0.1)", color:"#FF6A00", fontWeight:700 }}>{p.year}</span>
                    <a href={`https://arxiv.org/abs/${p.arxiv_id}`} target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}
                      style={{ fontSize:10, color:"rgba(255,255,255,0.22)", textDecoration:"none" }}>arXiv ↗</a>
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#fff", lineHeight:1.42, marginBottom:10,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.title}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginBottom:12 }}>{p.authors}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.22)", lineHeight:1.65, marginBottom:16,
                    display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.abstract}</div>
                  <div style={{ fontSize:12, color:"#FF6A00", fontWeight:600 }}>View Paper →</div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px clamp(16px,8vw,80px) 100px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,106,0,0.1) 0%, transparent 65%)" }} />
        <motion.div initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ position:"relative", zIndex:1 }}>
          <h2 className="cta-heading" style={{ fontSize:"clamp(46px,8.5vw,104px)", fontWeight:800, lineHeight:0.95,
            letterSpacing:"-0.038em", marginBottom:22 }}>
            Ready to explore<br />the power of <span style={{ color:"#FF6A00" }}>RAG?</span>
          </h2>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.35)", marginBottom:44 }}>Ask anything. Discover everything.</p>
          <Link href="/chat" style={{
            display:"inline-flex", alignItems:"center", gap:12,
            padding:"18px 40px", borderRadius:14,
            background:"#FF6A00", color:"#000",
            fontSize:17, fontWeight:700, textDecoration:"none",
            transition:"transform 0.15s, box-shadow 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 14px 44px rgba(255,106,0,0.48)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none";}}>
            Start Your Research Journey →
          </Link>
        </motion.div>
      </section>

      <footer className="site-footer" style={{ padding:"24px clamp(16px,8vw,80px)", borderTop:"1px solid rgba(255,255,255,0.05)",
        display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontSize:12, color:"#2a2a2a" }}>RAG Research Studio · Priyanka Narang</span>
        <span style={{ fontSize:12, color:"#2a2a2a" }}>Faithfulness 0.91 · Hybrid Retrieval · Zero Hallucinations</span>
      </footer>

      {selectedPaper && <PaperModal paper={selectedPaper} onClose={() => setSelectedPaper(null)} />}
    </div>
  );
}







