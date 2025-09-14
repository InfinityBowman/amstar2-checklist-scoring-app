# AMSTAR 2 Checklist Scoring App

Visit it [here](https://InfinityBowman.github.io/amstar2-checklist-scoring-app)

This is a web application for interactively filling out and scoring AMSTAR 2 checklists for systematic reviews. The app is built with SolidJS and D3 and stores your checklists locally in your browser using IndexedDB, so your data is private and persistent across sessions. **The app works fully offline and will save your checklists until you delete them in the site or clear your browser's site data.**

## Architecture

- **Frontend**: React + Vite (with D3 for visualizations)
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Database**: PostgreSQL 16
- **Containerization**: Docker + Docker Compose
- **Local Storage**: IndexedDB for offline functionality

## Features

- Fill out the full AMSTAR 2 checklist for a review
- Save and load your checklists automatically in your browser
- Can work fully offline—no internet connection required after first load
- Sync project with team when internet connection is back
- RESTful API for checklist management
- Database persistence with PostgreSQL
- Automatic database migrations with Alembic

## Planned Features

- **Multiple Reviews:** Add, save, and navigate between multiple AMSTAR 2 checklists for different reviews.
- **Data Visualization:** Visualize AMSTAR 2 results across your reviews to spot trends.
- **Import/Export CSV:** Import a checklist from a CSV file or export a checklist(s) to share.
- **Auto-Populate Yes/No:** Auto-populate the final Yes/No fields based on other fields.
- **Better Mobile Compatibility:** Make it look nice and usable on mobile.
- **Improved Accessibility:** Make it more accessible.
- **Collaborate realtime:** Collaborate on checklists in real time.
- **View Study PDF:** View a study PDF alongside the checklist.
- **Integration with Reference Managers:** Import studies from Zotero, EndNote, and others.

Stay tuned for updates as these features are developed!

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Git](https://git-scm.com/downloads)

### Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amstar2-checklist-scoring-app
   ```

2. **Environment Configuration**
   
   The `.env` file is already configured with default values:
   ```bash
   # Database Configuration
   POSTGRES_USER=amstar
   POSTGRES_PASSWORD=amstar_password
   POSTGRES_DB=amstar
   
   # Backend Configuration
   DATABASE_URL=postgresql+asyncpg://amstar:amstar_password@db:5432/amstar
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   API_PREFIX=/api/v1
   ENV=development
   LOG_LEVEL=info
   ```

3. **Start the Application**
   ```bash
   # Build and start all services
   docker-compose up --build -d
   
   # View logs (optional)
   docker-compose logs -f
   ```

4. **Access the Application**
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Database**: localhost:5433 (PostgreSQL)
   - **Frontend**: http://localhost:5173 (when running)

## 🛠️ Development

### Project Structure

```
amstar2-checklist-scoring-app/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── core/              # Configuration
│   │   ├── db/                # Database setup
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── utils/             # Utilities
│   │   └── main.py            # FastAPI app
│   ├── alembic/               # Database migrations
│   ├── Dockerfile             # Backend container
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React frontend
│   ├── src/                   # Source code
│   ├── package.json           # Node dependencies
│   └── vite.config.mjs        # Vite configuration
├── docker-compose.yml         # Multi-container setup
└── .env                       # Environment variables
```

### Backend Development

The backend is a FastAPI application with the following components:

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **PostgreSQL**: Production-ready database
- **Pydantic**: Data validation using Python type hints

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

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Database Management

The PostgreSQL database runs in a Docker container with:

- **Host**: localhost
- **Port**: 5433
- **Database**: amstar
- **Username**: amstar
- **Password**: amstar_password

#### Connect to Database

```bash
# Using Docker
docker-compose exec db psql -U amstar -d amstar

# Using external client (DBeaver, pgAdmin, etc.)
# Host: localhost, Port: 5433
```

## 🔧 Docker Commands

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

## 🤝 Contributing

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Backend changes go in `backend/app/`
   - Frontend changes go in `frontend/src/`
   - Database changes require Alembic migrations

4. **Test your changes**
   ```bash
   # Start the application
   docker-compose up --build -d
   
   # Verify everything works
   curl http://localhost:8000/docs
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

### Development Guidelines

- **Backend**: Follow FastAPI and SQLAlchemy best practices
- **Frontend**: Use React hooks and modern JavaScript
- **Database**: Always create migrations for schema changes
- **Docker**: Test your changes in containers before committing
- **API**: Document new endpoints with proper OpenAPI schemas

## 📝 API Documentation

When the backend is running, visit http://localhost:8000/docs for interactive API documentation powered by Swagger UI.

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: If port 5433 is in use, change it in `docker-compose.yml`
2. **Module not found**: Ensure `PYTHONPATH=/app` is set in the Dockerfile
3. **Database connection**: Verify the `DATABASE_URL` in `.env` matches your setup
4. **Container won't start**: Check logs with `docker-compose logs [service_name]`

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker system prune -f

# Restart fresh
docker-compose up --build -d
```

---
