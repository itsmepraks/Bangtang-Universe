# BTS Lyrical & Sonic Universe

A full-stack AI application that analyzes the complete discography of BTS, combining Natural Language Processing (NLP) for lyrical analysis and Audio Signal Processing for sonic analysis to power a generative Large Language Model (LLM).

## Project Structure

```
.
├── backend/              # Python backend (ETL, ML, FastAPI)
│   ├── database/        # Database models and connections
│   ├── scrapers/        # Data scraping modules
│   ├── utils/           # Utility functions
│   └── ingest.py        # Main data ingestion script
├── frontend/            # Next.js frontend (to be created in Phase 3)
├── PRD.md              # Product Requirements Document
└── todo.md             # Implementation TODO list
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- AWS Account (for S3, optional for Phase 1)
- Genius API Key (optional, web scraping fallback available)
- Spotify API Credentials (Client ID and Secret)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bts_universe
   DB_USER=your_username
   DB_PASSWORD=your_password

   # Genius API (optional)
   GENIUS_API_KEY=your_genius_api_key

   # Spotify API
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

   # AWS (optional for Phase 1)
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_S3_BUCKET_NAME=bts-universe-models
   ```

3. **Set up PostgreSQL database:**
   ```bash
   createdb bts_universe
   ```

4. **Initialize database schema:**
   ```bash
   python backend/ingest.py --init-db
   ```

5. **Test database connection:**
   ```bash
   python backend/ingest.py --test-connection
   ```

### Data Ingestion

1. **Ingest sample songs (for testing):**
   ```bash
   python backend/ingest.py --sample
   ```

2. **Ingest a single song:**
   ```bash
   python backend/ingest.py --song "Dynamite" --album "BE" --date "2020-08-21"
   ```

3. **Verify data:**
   Connect to PostgreSQL and check:
   ```sql
   SELECT COUNT(*) FROM songs;
   SELECT * FROM songs LIMIT 5;
   ```

## Development Status

### Phase 1: Data Foundation ✅ (In Progress)
- [x] Infrastructure setup
- [x] Database schema
- [x] Genius scraper
- [x] Spotify scraper
- [x] Data ingestion script
- [ ] Testing and validation

### Phase 2: Intelligence Building (Upcoming)
- Topic modeling (NLP)
- Sonic clustering (K-Means)
- LLM fine-tuning

### Phase 3: Application Development (Upcoming)
- FastAPI backend
- Next.js frontend

### Phase 4: Integration & Polish (Upcoming)
- Deployment
- Testing
- Documentation

## Notes

- UTF-8 encoding is enforced throughout the pipeline for proper Korean character handling
- The ingestion script includes retry logic and error handling
- Songs are skipped if they already exist in the database
- Audio features are optional - songs can be ingested without them

## License

[To be determined]


