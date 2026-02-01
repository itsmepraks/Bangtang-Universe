# 🏗️ BTS Universe - System Architecture

> Simple overview of the project architecture with Supabase integration

## High-Level Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Frontend (React + TypeScript)"]
        UI[UI Components]
        HOOKS[React Hooks]
        LOCAL[Local Data Fallback]
    end
    
    subgraph Database["💾 Supabase (Free Tier)"]
        DB[(PostgreSQL)]
        AUTH[Auth]
        RLS[Row Level Security]
    end
    
    subgraph Scripts["📜 Scripts (Run Locally)"]
        MIG[Migration Script]
        SCRAPE[Data Scrapers]
    end
    
    UI --> HOOKS
    HOOKS --> DB
    HOOKS -.-> LOCAL
    MIG --> DB
    SCRAPE --> DB
```

---

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant H as useHooks
    participant S as Supabase
    participant L as Local Data
    
    U->>R: Opens App
    R->>H: Call useAlbums()
    H->>S: Fetch from database
    alt Supabase Available
        S-->>H: Return albums
    else Supabase Unavailable
        H->>L: Fallback to local
        L-->>H: Return local data
    end
    H-->>R: Albums data
    R-->>U: Render UI
```

---

## Project Structure

```mermaid
flowchart LR
    subgraph src["src/"]
        direction TB
        COMP[components/]
        DATA[data/]
        HOOK[hooks/]
        LIB[lib/]
        TYPES[types/]
        SERV[services/]
    end
    
    subgraph other["Project Root"]
        direction TB
        DBDIR[database/]
        SCRIPT[scripts/]
        DOCS[docs/]
    end
    
    HOOK --> LIB
    LIB --> TYPES
    COMP --> HOOK
    SCRIPT --> DBDIR
```

---

## Database Schema

```mermaid
erDiagram
    ALBUMS ||--o{ SONGS : contains
    MEMBERS ||--o{ SOLO_ALBUMS : has
    SONGS ||--o| LYRICS : has
    
    ALBUMS {
        int id PK
        string title
        string title_korean
        date release_date
        string type
        string era
        string cover_color
    }
    
    SONGS {
        int id PK
        string title
        int album_id FK
        int bpm
        float energy
        float valence
        string sentiment
        boolean is_title_track
    }
    
    MEMBERS {
        string id PK
        string stage_name
        string full_name
        int komca_credits
        string color
    }
    
    LYRICS {
        int id PK
        int song_id FK
        text lyrics_korean
        text lyrics_english
    }
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + TypeScript | UI & Logic |
| **Styling** | Tailwind CSS 4 | Styling |
| **Build** | Vite 7 | Dev server & bundling |
| **Database** | Supabase (PostgreSQL) | Data storage |
| **Scripts** | tsx + Node.js | Migrations & scrapers |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Database client configuration |
| `src/hooks/useAlbums.ts` | Albums data hook |
| `src/hooks/useSongs.ts` | Songs data hook |
| `src/hooks/useMembers.ts` | Members data hook |
| `src/types/database.ts` | TypeScript types for DB |
| `database/schema.sql` | PostgreSQL schema |
| `scripts/migrate-to-supabase.ts` | Data migration script |

---

## Future Additions (Optional)

```mermaid
flowchart LR
    subgraph Current["✅ Current"]
        DB[(Supabase)]
        HOOKS[React Hooks]
    end
    
    subgraph Future["🔮 Optional Future"]
        GENIUS[Genius API]
        AI[In-Browser AI]
        VIZ[Visualizations]
    end
    
    GENIUS -.->|Lyrics| DB
    DB --> HOOKS
    HOOKS --> VIZ
    HOOKS --> AI
```

---

💜 *"I purple you"* - Architecture designed with love for BTS & ARMY
