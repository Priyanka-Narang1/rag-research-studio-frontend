"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: 64,
      background: scrolled ? "rgba(5,5,5,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.4s ease",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FF6A00", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M7 2l5 5-5 5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>RAG Research Studio</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {[{ href: "/", label: "Home" }, { href: "/papers", label: "Papers" }, { href: "/chat", label: "Research" }].map(({ href, label }) => (
          <Link key={href} href={href} style={{
            color: pathname === href ? "#FF6A00" : "rgba(255,255,255,0.5)",
            fontSize: 14, fontWeight: 500, textDecoration: "none",
            transition: "color 0.2s",
          }}>{label}</Link>
        ))}
      </div>

      <Link href="/chat" style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 22px", borderRadius: 10,
        background: "#FF6A00", color: "#000",
        fontSize: 14, fontWeight: 700, textDecoration: "none",
        transition: "opacity 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "scale(1.03)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}>
        Start Research
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 6.5h9M6.5 2l4.5 4.5L6.5 11" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </nav>
  );
}
