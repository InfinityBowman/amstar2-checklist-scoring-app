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
   cd frontend
   npm run docker
   npm install
   npm run build
   npm run dev

   # View logs (optional)
   docker-compose logs -f
   ```

3. **Access the Application**
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Database**: localhost:54321 (PostgreSQL)
   - **Frontend**: [http://localhost:5173/amstar2-checklist-scoring-app/](http://localhost:5173/amstar2-checklist-scoring-app/)

---

#### Running Backend Commands

```bash
# Enter the backend container
docker-compose exec backend bash

# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# View container logs
docker-compose logs backend

# Restart backend only
docker-compose restart backend
```

### Database Management

The PostgreSQL database runs in a Docker container with:

- **Host**: localhost
- **Port**: 54321
- **Database**: amstar
- **Username**: amstar
- **Password**: amstar_password

#### Connect to Database

```bash
# Using Docker
docker-compose exec db psql -U amstar -d amstar

# Host: localhost, Port: 54321
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Build and start (after code changes)
docker-compose up --build -d

# View running containers
docker-compose ps

# View logs
docker-compose logs [service_name]

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Rebuild specific service
docker-compose build backend
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker system prune -f

# Restart fresh
docker-compose up --build -d
```
