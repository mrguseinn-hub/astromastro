# Personal Insight Engine - Development Status

**Last Updated:** 2026-03-26
**Status:** MVP Complete, Ready for Deploy

---

## 🚀 Quick Start

```bash
cd astro-mvp
npm install
npm run dev
```

- **App:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

---

## 📁 Project Structure

```
astro-mvp/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind + CSS variables
│   ├── reading/
│   │   ├── new/page.tsx            # Birth data form
│   │   └── [id]/page.tsx           # Reading display
│   ├── admin/
│   │   ├── layout.tsx              # Admin auth wrapper
│   │   ├── page.tsx                # Dashboard
│   │   ├── login/page.tsx          # Login form
│   │   ├── entities/               # CRUD for astro_entities
│   │   ├── interpretations/        # CRUD for interpretation_entries
│   │   ├── language-bank/          # CRUD for language_bank
│   │   ├── rules/                  # CRUD for combination_rules
│   │   └── readings/               # View generated readings
│   └── api/
│       ├── readings/
│       │   ├── generate/route.ts   # POST - Create reading
│       │   ├── [id]/route.ts       # GET - Retrieve reading
│       │   └── [id]/pdf/route.ts   # GET - Generate PDF HTML
│       └── admin/
│           ├── entities/route.ts
│           ├── interpretations/route.ts
│           ├── language-bank/route.ts
│           └── rules/route.ts
├── lib/
│   ├── astro/
│   │   ├── chart-calculator.ts     # Natal chart + Transit calculation
│   │   └── geocoding.ts            # Location → lat/lng
│   ├── scoring/
│   │   └── scoring-engine.ts       # Theme scoring from chart
│   ├── llm/
│   │   └── glm-client.ts           # GLM-5 via DashScope
│   ├── db/
│   │   └── supabase.ts             # Supabase client
│   └── auth/
│       └── admin-auth.ts           # Admin authentication
├── types/
│   └── index.ts                    # TypeScript interfaces
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## 🗄️ Database Tables

| Table | Rows | Purpose |
|-------|------|---------|
| `astro_entities` | 22 | Planet/sign/house/aspect codes |
| `interpretation_entries` | 5 | Expert knowledge base |
| `language_bank` | 16 | Human-readable sentences |
| `combination_rules` | 2 | Narrative combinations |
| `output_templates` | 6 | Reading section templates |
| `readings` | 7+ | Generated user readings |
| `admin_profiles` | 0 | Admin users (RLS enabled) |

---

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://akryacotozlzjwnjluuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GLM-5 LLM
DASHSCOPE_API_KEY=sk-sp-b65486ff779540da86e4566fd090f0f9
DASHSCOPE_BASE_URL=https://coding-intl.dashscope.aliyuncs.com/v1
```

---

## 📊 Reading Flow

```
1. User submits birth data (date, time, location, focus area)
   ↓
2. calculateNatalChart() - @astrologer/astro-core
   ↓
3. calculateTransits() - Current planetary positions
   ↓
4. runScoringEngine() - Match entities, calculate theme scores
   ↓
5. getLanguageSentences() - Fetch from language_bank
   ↓
6. generateReading() - GLM-5 assembles reading
   ↓
7. Save to database, return reading ID
```

---

## 📝 Reading Output Sections

1. **Your Core Pattern** - Fundamental way of being
2. **How You Build Connection** - Relationship patterns
3. **What Triggers Your Protection Mode** - Defense mechanisms
4. **What's Active Right Now** - Current transits
5. **This Week — Don't Do This** - Practical warning
6. **This Week — Do This Instead** - Practical advice

---

## 🔐 Admin Setup

1. Create user in Supabase Auth
2. Add to admin_profiles:
```sql
INSERT INTO admin_profiles (id) VALUES ('user-uuid-from-auth');
```

---

## 🚢 Deployment

### Render Blueprint

1. Go to https://dashboard.render.com
2. Click **New + → Blueprint**
3. Select `mrguseinn-hub/astromastro` repo
4. Click **Apply**

The `render.yaml` contains all configuration.

### Manual Deploy

```yaml
# render.yaml settings
buildCommand: npm install && npm run build
startCommand: npm start
env: node
plan: starter (or free)
```

---

## ✅ Completed Tasks

- [x] Swiss Ephemeris initialization (lazy loading)
- [x] Real natal chart calculation
- [x] Transit calculation
- [x] Admin Panel with Supabase Auth
- [x] CRUD for all admin tables
- [x] PDF generation endpoint
- [x] Local testing complete
- [x] Push to GitHub

## ⏳ Pending

- [ ] Deploy to Render
- [ ] Create first admin user
- [ ] Add more interpretation entries
- [ ] Add more language bank sentences

---

## 🐛 Known Issues

1. **Swiss Ephemeris native module** - Uses lazy initialization to avoid build-time errors
2. **Admin without login** - Currently shows content without sidebar (not a security issue, API requires auth)
3. **Mock data fallback** - If chart calculation fails, mock data is used

---

## 📱 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/readings/generate` | Create new reading |
| GET | `/api/readings/[id]` | Get reading by ID |
| GET | `/api/readings/[id]/pdf` | Get PDF HTML |
| GET/POST/PUT/DELETE | `/api/admin/entities` | CRUD entities |
| GET/POST/PUT/DELETE | `/api/admin/interpretations` | CRUD interpretations |
| GET/POST/PUT/DELETE | `/api/admin/language-bank` | CRUD language bank |
| GET/POST/PUT/DELETE | `/api/admin/rules` | CRUD rules |

---

## 🔗 Links

- **GitHub:** https://github.com/mrguseinn-hub/astromastro
- **Supabase:** https://supabase.com/dashboard/project/akryacotozlzjwnjluuy
- **Render:** https://dashboard.render.com

---

## 📚 Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Astro:** @astrologer/astro-core, @swisseph/node
- **LLM:** GLM-5 via Alibaba DashScope
- **PDF:** HTML print (browser-based)