# RAG Research Studio — Frontend

A premium Next.js frontend for the RAG Research Studio — a production-grade Retrieval-Augmented Generation system over 18 curated research papers.

**Live:** https://rag-research-studio.netlify.app
**Backend API:** https://codingpros-rag-on-rag-papers.hf.space
**Backend Repo:** https://github.com/Priyanka-Narang1/Rag-on-Rag-Papers

---

## Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)
*Centered hero with floating glass paper cards reacting to mouse movement. Cards are populated from the live backend API — real paper titles, authors, and years.*

### Chat Interface
![Chat Interface](screenshots/chat.png)
*Three-column layout: conversation history (left), chat (center), retrieved sources (right). Animated 6-step retrieval sequence plays before every answer.*

### Papers Library
![Papers Library](screenshots/papers.png)
*All 18 research papers in a searchable grid. Click any card to open a premium modal with full abstract, PDF link, and arXiv link.*

---

## Design Philosophy

**Premium AI startup aesthetic** — inspired by Linear, Framer, and Perplexity AI.

- **#050505** matte black background — not pure black, avoids harshness
- **#FF6A00** burnt orange accent — used only for meaningful highlights, never decorative
- **Space Grotesk** — premium sans-serif with tight letter-spacing on large headings
- Every animation has a purpose: floating cards tell the retrieval story, retrieval steps show the pipeline working, hover states confirm interactability

**What was deliberately avoided:**
- No fake metrics or placeholder data — everything from the real backend
- No enterprise features that don't exist in the backend (no workspaces, no similarity scores, no complex filters)
- No generic Tailwind template feel — all layout uses custom inline styles with precise values

---

## Pages

### Landing Page (`/`)
- Centered hero with large display typography
- 6 floating glass paper cards on left/right with mouse parallax — populated from `/api/papers`
- "How RAG Works" animated pipeline section (5 steps)
- Key Features grid, paper preview grid (top 6 from API), CTA section
- Smooth scroll via Lenis

### Chat Page (`/chat`)
- Three-column layout: history / conversation / sources
- Animated retrieval sequence (6 steps with progress indicators while waiting)
- Citation cards with expandable excerpts from retrieved chunks
- Key Takeaways section per response (from backend v2.2 prompt)
- Per-request latency breakdown visible (embed / rerank / LLM / total ms)

### Papers Library (`/papers`)
- Full grid of all 18 papers loaded from live API
- Real-time search by title, author, or year
- Premium modal on click: title, authors, abstract, PDF link, arXiv link, "Ask about this paper" button

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework |
| TypeScript | Type safety |
| Framer Motion | Animations — card reveals, retrieval sequence, page transitions |
| Lenis | Smooth scroll |
| Tailwind CSS | Utility classes |
| Space Grotesk (Google Fonts) | Typography |

---

## How It Connects to the Backend

The frontend is a pure UI layer — it calls the FastAPI backend for all data. No mock responses anywhere.

```
Landing page  →  GET /api/papers     (paper grid + floating cards)
Chat page     →  POST /api/query     (question → answer + citations + key_takeaways + latencies)
Papers page   →  GET /api/papers     (full searchable library)
```

Environment variable:
```
NEXT_PUBLIC_API_URL=https://codingpros-rag-on-rag-papers.hf.space
```

---

## Run Locally

```bash
git clone https://github.com/Priyanka-Narang1/rag-research-studio-frontend
cd rag-research-studio-frontend
npm install

# create .env.local
echo "NEXT_PUBLIC_API_URL=https://codingpros-rag-on-rag-papers.hf.space" > .env.local

npm run dev
# open http://localhost:3000
```

---

## Deployment

Deployed on **Netlify** with automatic deploys on every push to `main`.

Build settings:
- Build command: `npm run build`
- Publish directory: `.next`
- Environment variable: `NEXT_PUBLIC_API_URL`
