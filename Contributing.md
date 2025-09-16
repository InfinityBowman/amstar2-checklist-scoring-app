# Contributing to CoRATES

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Git](https://git-scm.com/downloads)
- [Node](https://nodejs.org/en/download)

## Quick Start

1. **Fork the repository** and clone it to your local machine and cd into that directory:

   ```sh
   git clone https://github.com/InfinityBowman/amstar2-checklist-scoring-app.git
   cd amstar2-checklist-scoring-app
   ```

2. **Start the Application**

   ```bash
   # Build and start all services
   docker-compose up --build -d

   # Alternatively, for frontend dev (--build is needed to pull in new changes to docker, if no changes are made, then it can be left out)
   docker compose up --build backend db -d
   cd frontend
   npm install
   npm run dev

   # View logs (optional)
   docker-compose logs -f
   ```

3. **Access the Application**
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Database**: localhost:5433 (PostgreSQL)
   - **Frontend**: [http://localhost:5173/amstar2-checklist-scoring-app/](http://localhost:5173/amstar2-checklist-scoring-app/)
