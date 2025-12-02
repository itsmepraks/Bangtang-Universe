# Product Requirements Document (PRD)

## Project Name: BTS Lyrical & Sonic Universe

**Version:** 3.0 (Final Engineering Spec)
**Date:** November 28, 2025
**Status:** Ready for Development
**Tech Stack:** Python (FastAPI/AI) + Next.js (Frontend) + AWS

-----

## 1. Executive Summary

The "BTS Lyrical & Sonic Universe" is a full-stack AI application that analyzes the complete discography of the artist BTS. It combines Natural Language Processing (NLP) for lyrical analysis and Audio Signal Processing for sonic analysis to power a generative Large Language Model (LLM).

The system allows users to explore data visualizations of the artist's evolution and interact with a custom AI to generate "BTS-style" lyrics based on specific sonic and lyrical parameters.

-----

## 2. System Architecture Overview

The system follows a **Decoupled Architecture**:

1.  **Backend (The "Brain"):** A Python monorepo housing the ETL pipeline, ML training scripts, and a FastAPI server.
2.  **Frontend (The "Face"):** A Next.js 14+ application (App Router) for data visualization and user interaction.
3.  **Database:** PostgreSQL (Relation Data) + AWS S3 (Model Artifacts & Blobs).

-----

## 3. Module Specifications (Backend)

### 3.1 Module A: Data Ingestion & Storage (ETL Pipeline)

**Owner:** Data Engineer / Backend Dev
**Objective:** Build a robust dataset of lyrics and audio features.

  * **Data Sources:**
      * **Lyrics:** Genius API or Web Scraping (BeautifulSoup). *Requirement: Must fetch both Original (Korean) and English Translation.*
      * **Audio:** Spotify Web API (Get Audio Features for a Track).
  * **Database Schema (PostgreSQL):**
      * `Table: Songs`
          * `id` (UUID, PK)
          * `title_en` (VarChar)
          * `title_kr` (VarChar)
          * `release_date` (Date)
          * `album_name` (VarChar)
          * `lyrics_original` (Text)
          * `lyrics_translation` (Text)
      * `Table: AudioFeatures`
          * `song_id` (FK)
          * `danceability` (Float)
          * `energy` (Float)
          * `valence` (Float)
          * `tempo` (Float)
          * `acousticness` (Float)
  * **Acceptance Criteria:**
      * Script `ingest.py` runs without error.
      * Database is populated with >200 songs.
      * UTF-8 encoding is enforced (crucial for Korean characters).

### 3.2 Module B: The Analysis Engine (ML/NLP)

**Owner:** ML Engineer
**Objective:** classify songs into "Topics" and "Moods" to label the dataset.

  * **Task B1: Topic Modeling (NLP)**
      * **Library:** `BERTopic` or `Gensim` (LDA).
      * **Input:** English translated lyrics.
      * **Logic:** Remove stop words -> Lemmatize -> Run Clustering.
      * **Output:** Assign a `primary_topic` string to every song in the DB (e.g., "Self-Reflection", "Social Commentary").
  * **Task B2: Sonic Clustering (Audio)**
      * **Library:** `Scikit-learn` (K-Means).
      * **Input:** Normalized vectors of `[energy, valence, danceability, tempo]`.
      * **Logic:** Determine optimal $k$ (likely 4-6 clusters).
      * **Output:** Assign a `sonic_cluster_id` and a mapped human-readable label (e.g., "Hype/Performance", "R&B Ballad") to each song.

### 3.3 Module C: The Generative Core (LLM)

**Owner:** AI Engineer
**Objective:** Fine-tune a model to generate lyrics.

  * **Base Model:** `Mistral-7B-Instruct` or `DistilGPT-2` (depending on compute availability).
  * **Training Data:** The cleaned `lyrics_translation` column from Module A.
  * **Fine-Tuning Strategy:**
      * Use **LoRA (Low-Rank Adaptation)** for efficient fine-tuning.
      * **Prompt Structure for Training:**
        ```text
        [INST] Write lyrics about {Topic} with a {Mood} vibe. [/INST]
        {Actual Lyrics}
        ```
  * **Inference Constraints:**
      * Max new tokens: 150 (approx. 1 verse + 1 chorus).
      * Temperature: 0.7 (balance between creativity and coherence).

### 3.4 Module D: The API Layer (FastAPI)

**Owner:** Backend Dev
**Objective:** Expose data and inference to the frontend.

  * **Endpoints:**
      * `GET /api/v1/analytics/overview`: Returns aggregated data for charts (e.g., Mood distribution over years).
      * `GET /api/v1/songs`: Returns list of songs with their analyzed Topic and Mood.
      * `POST /api/v1/generate`:
          * **Payload:** `{ "topic": "Heartbreak", "mood": "Energetic", "language": "English" }`
          * **Response:** `{ "generated_text": "..." }`
  * **Performance Requirement:** Generation requests must timeout gracefully after 30s if the GPU is busy.

-----

## 4. Frontend Specifications (Next.js)

### 4.1 Global Standards

  * **Framework:** Next.js 14 (App Router).
  * **Styling:** Tailwind CSS.
  * **State Management:** React Query (TanStack Query) for handling API data fetching and caching.

### 4.2 Page: The Dashboard (`/dashboard`)

  * **Visualizations (using `Recharts` or `Chart.js`):**
    1.  **The "Vibe" Scatter Plot:** X-axis = Valence (Happy/Sad), Y-axis = Energy. Each dot is a song, colored by Album. Hovering shows the song title.
    2.  **Lyrical Evolution Line Chart:** Usage of specific keywords (e.g., "Dream", "Love") over time (years).
    3.  **Radar Chart:** Compare the audio features of two selected albums.

### 4.3 Page: The Studio (`/studio`)

  * **Interactive Interface:**
      * **Input Section:** Two dropdown menus populated by the backend options:
        1.  "Select a Topic" (e.g., Growing Up, Society).
        2.  "Select a Vibe" (e.g., Hype, Soft).
      * **Action:** A large "Compose" button.
      * **Output Section:** A typewriter-effect text area that displays the generated lyrics.
      * **"Download" Feature:** Button to save the generated lyrics as a `.txt` or `.png` card.

-----

## 5. Non-Functional Requirements (NFRs)

1.  **Latency:**
      * Dashboard data load: < 800ms.
      * Lyric Generation: < 10 seconds (Stream the response if possible).
2.  **Scalability:** The read-only endpoints (Dashboard) should be cacheable via CDN (Vercel Edge).
3.  **Security:**
      * API keys (OpenAI, Spotify) must be stored in `.env` files and never committed to GitHub.
      * Implement rate limiting on the `/generate` endpoint to prevent cost spikes/abuse.

-----

## 6. Implementation Roadmap

### Phase 1: Data Foundation (Week 1)

  * [ ] Set up AWS S3 and local PostgreSQL.
  * [ ] Write `spotify_scraper.py` and `genius_scraper.py`.
  * [ ] Populate DB with raw data.

### Phase 2: Intelligence Building (Week 2)

  * [ ] Train K-Means model for Audio clustering. Save model using `joblib`.
  * [ ] Run Topic Modeling on lyrics. Update DB with tags.
  * [ ] (Hardest Task) Fine-tune LLM on Google Colab or AWS SageMaker. Save weights to S3.

### Phase 3: Application Development (Week 3)

  * [ ] Build FastAPI endpoints.
  * [ ] Build Next.js Dashboard with dummy data first, then connect API.
  * [ ] Build the Generator UI.

### Phase 4: Integration & Polish (Week 4)

  * [ ] Load the fine-tuned model into the FastAPI app (ensure Docker container has enough RAM).
  * [ ] Deploy Backend to AWS (App Runner or EC2).
  * [ ] Deploy Frontend to Vercel.

-----

## 7. Deliverables Checklist

  * [ ] **Source Code:** GitHub repository with `/backend` and `/frontend` directories.
  * [ ] **Database Dump:** SQL file of the curated BTS dataset.
  * [ ] **Model Artifacts:** The fine-tuned LoRA adapter files or PyTorch model `.bin`.
  * [ ] **Live URL:** A working link to the Vercel deployment.


