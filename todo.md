# BTS Lyrical & Sonic Universe - TODO

This file tracks all tasks and implementation items for the BTS Lyrical & Sonic Universe project as specified in the PRD.

## Phase 1: Data Foundation (Week 1)

### Infrastructure Setup
- [x] Set up AWS S3 bucket for model artifacts and blobs (configuration created)
- [x] Set up local PostgreSQL database (connection and setup scripts created)
- [x] Configure database connection and connection pooling
- [x] Create database schema (Songs and AudioFeatures tables)
- [x] Set up environment variables (.env files) for API keys
- [x] Create .gitignore to exclude .env files and sensitive data

### Data Ingestion Scripts
- [x] Create `backend/ingest.py` script structure
- [x] Implement Genius API integration for lyrics scraping
  - [x] Fetch original Korean lyrics
  - [x] Fetch English translations
  - [x] Handle UTF-8 encoding for Korean characters
  - [x] Error handling and retry logic
- [x] Implement web scraping fallback (BeautifulSoup) if API fails
- [x] Implement Spotify Web API integration for audio features
  - [x] Get Audio Features for tracks
  - [x] Extract: danceability, energy, valence, tempo, acousticness
- [x] Create data validation and cleaning functions
- [x] Implement database insertion logic with proper error handling
- [ ] Test ingestion script with sample songs
- [ ] Run full ingestion to populate database with >200 songs
- [ ] Verify UTF-8 encoding is properly enforced throughout pipeline

### Database Schema Implementation
- [x] Create `Songs` table with all required fields:
  - [x] id (UUID, Primary Key)
  - [x] title_en (VarChar)
  - [x] title_kr (VarChar)
  - [x] release_date (Date)
  - [x] album_name (VarChar)
  - [x] lyrics_original (Text)
  - [x] lyrics_translation (Text)
- [x] Create `AudioFeatures` table with all required fields:
  - [x] song_id (Foreign Key to Songs)
  - [x] danceability (Float)
  - [x] energy (Float)
  - [x] valence (Float)
  - [x] tempo (Float)
  - [x] acousticness (Float)
- [x] Add indexes for performance optimization
- [x] Create database migration scripts

## Phase 2: Intelligence Building (Week 2)

### Topic Modeling (NLP)
- [ ] Set up NLP environment with BERTopic or Gensim
- [ ] Create text preprocessing pipeline:
  - [ ] Remove stop words
  - [ ] Implement lemmatization
  - [ ] Handle special characters and formatting
- [ ] Implement topic modeling algorithm (BERTopic or LDA)
- [ ] Run clustering on English translated lyrics
- [ ] Analyze and validate topic clusters
- [ ] Create mapping of topics to human-readable labels
- [ ] Add `primary_topic` column to Songs table
- [ ] Update database with topic assignments for all songs
- [ ] Create visualization/analysis of topic distribution

### Sonic Clustering (Audio)
- [ ] Set up Scikit-learn environment
- [ ] Create feature extraction pipeline:
  - [ ] Normalize audio feature vectors [energy, valence, danceability, tempo]
  - [ ] Handle missing data
- [ ] Implement K-Means clustering
- [ ] Determine optimal k value (4-6 clusters) using elbow method or silhouette analysis
- [ ] Train K-Means model
- [ ] Save model using joblib
- [ ] Assign `sonic_cluster_id` to all songs
- [ ] Create human-readable labels for clusters (e.g., "Hype/Performance", "R&B Ballad")
- [ ] Add `sonic_cluster_id` and `sonic_cluster_label` columns to Songs table
- [ ] Update database with sonic cluster assignments
- [ ] Validate cluster assignments make musical sense

### LLM Fine-Tuning
- [ ] Set up training environment (Google Colab or AWS SageMaker)
- [ ] Choose base model (Mistral-7B-Instruct or DistilGPT-2)
- [ ] Prepare training data from `lyrics_translation` column
- [ ] Clean and format training data
- [ ] Implement prompt structure for training:
  ```
  [INST] Write lyrics about {Topic} with a {Mood} vibe. [/INST]
  {Actual Lyrics}
  ```
- [ ] Set up LoRA (Low-Rank Adaptation) for efficient fine-tuning
- [ ] Configure training hyperparameters
- [ ] Run fine-tuning process
- [ ] Evaluate model performance
- [ ] Save fine-tuned model weights (LoRA adapter or PyTorch .bin)
- [ ] Upload model artifacts to AWS S3
- [ ] Document model version and training details

## Phase 3: Application Development (Week 3)

### Backend API (FastAPI)
- [ ] Set up FastAPI project structure
- [ ] Configure CORS for frontend communication
- [ ] Set up dependency injection and project structure
- [ ] Implement database connection and session management
- [ ] Create data models/schemas using Pydantic
- [ ] Implement `GET /api/v1/analytics/overview` endpoint:
  - [ ] Aggregate mood distribution over years
  - [ ] Calculate topic distribution
  - [ ] Prepare data for dashboard visualizations
  - [ ] Optimize queries for < 800ms response time
- [ ] Implement `GET /api/v1/songs` endpoint:
  - [ ] Return list of songs with Topic and Mood
  - [ ] Add pagination support
  - [ ] Add filtering options
- [ ] Implement `POST /api/v1/generate` endpoint:
  - [ ] Load fine-tuned model (from S3 or local)
  - [ ] Accept payload: { "topic": string, "mood": string, "language": string }
  - [ ] Generate lyrics with constraints:
    - Max new tokens: 150
    - Temperature: 0.7
  - [ ] Implement streaming response (if possible)
  - [ ] Add timeout handling (30s graceful timeout)
  - [ ] Implement rate limiting to prevent abuse
- [ ] Add error handling and logging
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Write unit tests for API endpoints
- [ ] Test API endpoints with Postman/curl

### Frontend Setup (Next.js)
- [ ] Initialize Next.js 14 project with App Router
- [ ] Set up Tailwind CSS configuration
- [ ] Install and configure React Query (TanStack Query)
- [ ] Set up API client configuration
- [ ] Create environment variables for API endpoints
- [ ] Set up project folder structure
- [ ] Configure TypeScript (if using)
- [ ] Set up ESLint and Prettier

### Dashboard Page (`/dashboard`)
- [ ] Create dashboard page layout
- [ ] Install and configure charting library (Recharts or Chart.js)
- [ ] Implement "Vibe" Scatter Plot:
  - [ ] X-axis: Valence (Happy/Sad)
  - [ ] Y-axis: Energy
  - [ ] Color dots by Album
  - [ ] Add hover tooltip showing song title
  - [ ] Fetch data from `/api/v1/analytics/overview`
- [ ] Implement Lyrical Evolution Line Chart:
  - [ ] Track keyword usage over time (e.g., "Dream", "Love")
  - [ ] X-axis: Years
  - [ ] Y-axis: Keyword frequency
  - [ ] Multiple lines for different keywords
- [ ] Implement Radar Chart:
  - [ ] Compare audio features of two selected albums
  - [ ] Features: danceability, energy, valence, tempo, acousticness
  - [ ] Album selection dropdown
- [ ] Add loading states and error handling
- [ ] Implement responsive design
- [ ] Optimize for < 800ms load time (caching, CDN)

### Studio Page (`/studio`)
- [ ] Create studio page layout
- [ ] Implement input section:
  - [ ] "Select a Topic" dropdown (populated from backend)
  - [ ] "Select a Vibe" dropdown (populated from backend)
  - [ ] Fetch available options from API
- [ ] Implement "Compose" button with loading state
- [ ] Implement output section:
  - [ ] Text area for generated lyrics
  - [ ] Typewriter effect animation
  - [ ] Handle streaming response (if implemented)
- [ ] Implement download feature:
  - [ ] Download as .txt file
  - [ ] Download as .png card (image generation)
- [ ] Add error handling and user feedback
- [ ] Implement responsive design
- [ ] Add copy-to-clipboard functionality

### Frontend Integration
- [ ] Connect Dashboard to backend API
- [ ] Connect Studio to backend API
- [ ] Replace dummy data with real API calls
- [ ] Implement error boundaries
- [ ] Add loading skeletons
- [ ] Test all user flows end-to-end

## Phase 4: Integration & Polish (Week 4)

### Model Integration
- [ ] Load fine-tuned model into FastAPI app
- [ ] Ensure Docker container has sufficient RAM
- [ ] Optimize model loading (lazy loading, caching)
- [ ] Test model inference performance
- [ ] Handle GPU/CPU fallback scenarios

### Deployment Preparation
- [ ] Create Dockerfile for backend
- [ ] Configure Docker for model serving
- [ ] Set up environment variables for production
- [ ] Create deployment scripts
- [ ] Set up CI/CD pipeline (optional but recommended)

### Backend Deployment (AWS)
- [ ] Choose deployment platform (App Runner or EC2)
- [ ] Set up AWS infrastructure:
  - [ ] Configure security groups
  - [ ] Set up load balancer (if needed)
  - [ ] Configure auto-scaling (if needed)
- [ ] Deploy FastAPI application
- [ ] Configure database connection for production
- [ ] Set up monitoring and logging (CloudWatch)
- [ ] Test deployed API endpoints
- [ ] Configure CDN caching for read-only endpoints

### Frontend Deployment (Vercel)
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings
- [ ] Set up environment variables
- [ ] Deploy frontend application
- [ ] Configure custom domain (if applicable)
- [ ] Test deployed frontend
- [ ] Verify API integration works in production

### Final Deliverables
- [ ] Organize source code in GitHub repository:
  - [ ] `/backend` directory with all Python code
  - [ ] `/frontend` directory with Next.js code
  - [ ] README.md with setup instructions
- [ ] Create database dump (SQL file) of curated BTS dataset
- [ ] Document model artifacts location (S3 bucket/path)
- [ ] Create deployment documentation
- [ ] Test live URL and verify all features work
- [ ] Create user documentation/guide

### Testing & Quality Assurance
- [ ] End-to-end testing of all features
- [ ] Performance testing (latency requirements)
- [ ] Security audit (API keys, rate limiting)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Load testing for API endpoints

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Model training documentation
- [ ] Deployment guide
- [ ] User guide
- [ ] Developer setup guide

## Ongoing Maintenance Tasks
- [ ] Monitor API performance and errors
- [ ] Update model if needed
- [ ] Add new songs to database periodically
- [ ] Optimize database queries as data grows
- [ ] Update dependencies for security patches

