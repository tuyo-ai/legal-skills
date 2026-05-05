# Project Plan: LEGAL SKILLS 🌿

## 🎯 Objective
Create a globally scalable, jurisdiction-aware directory of legal AI assets (Skills, Agents, MCPs) with a high-end Solarpunk web interface.

## 🛠 Tech Stack
- **Content Source:** GitHub Repository (`tuyo-ai/legal-skills`)
- **Frontend:** Astro (Static Site Generation)
- **Styling:** Tailwind CSS + Solarpunk design tokens
- **Search:** Fuse.js (client-side indexing of Markdown)
- **Deployment:** Vercel or Netlify (connected to GitHub)
- **Domain:** `legalskills.sh`

## 🗺 Roadmap

### Phase 1: Foundation (Completed ✅)
- [x] Project structure initialized.
- [x] Contribution templates created.
- [x] `CONTRIBUTING.md` and `README.md` established.

### Phase 2: Data Architecture (Pending ⏳)
- [ ] Define exact Markdown schema for metadata (to ensure search works).
- [ ] Create initial sample data (1 Skill, 1 Agent, 1 MCP) for testing.
- [ ] Setup folder hierarchy for English/Spanish and US/Spain/UK.

### Phase 3: Web Development - Solarpunk UI (Pending ⏳)
- [ ] **Design System:** Define colors (Emerald, Gold, Sand, Deep Forest) and typography.
- [ ] **Component Library:**
    - `Card.astro`: For displaying skills/agents/mcps.
    - `SearchBar.astro`: Text-based filtering.
    - `Navigation.astro`: Top bar with "List SKILL.md" button.
- **Pages:**
    - `index.astro`: The searchable Directory.
    - `resources/index.astro`: The "Blog" (How-to guide).
    - `[type]/[country]/[slug].astro`: Dynamic detail pages.

### Phase 4: Advanced Features (Pending ⏳)
- [ ] **Search Engine:** Implement Fuse.js indexing during build.
- [ ] **Multi-language Support:** Implement i18n for the UI.
- [ ] **PR Redirect Logic:** Ensure the "List SKILL.md" button correctly points to GitHub with the template.

### Phase 5: Deployment (Pending ⏳)
- [ ] Connect repo to hosting provider.
- [ ] Point `legalskills.sh` to the host.
