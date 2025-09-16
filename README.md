# Collaborative Research Appraisal Tool for Evidence Synthesis (CoRATES)

This is a web application for interactively filling out and scoring AMSTAR 2 checklists for systematic reviews. The app is built with SolidJS and FastAPI, and stores your checklists locally in your browser using IndexedDB. **The app works fully offline and will save your checklists until you delete them in the site or clear your browser's site data.** It will also provide optional online collaboration on projects.

Visit it [here](https://InfinityBowman.github.io/amstar2-checklist-scoring-app)

This is a web application for interactively filling out and scoring AMSTAR 2 checklists for systematic reviews. The app is built with SolidJS and D3 and stores your checklists locally in your browser using IndexedDB, so your data is private and persistent across sessions. **The app works fully offline and will save your checklists until you delete them in the site or clear your browser's site data.**

## Architecture

- **Frontend**: SolidJS + Vite (with D3 for visualizations)
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Database**: PostgreSQL 16
- **Containerization**: Docker + Docker Compose
- **Local Storage**: IndexedDB for offline functionality

## Features

- Intended as a Progressive Web App (PWA) and work offline with no internet connection required after first load
- Auto-populate the final Yes/No AMSTAR 2 checklist fields.
- Automatically calculate score for a filled-out AMSTAR 2 checklist.
- Visualize AMSTAR 2 results across your reviews to spot trends.
- Add, save, and navigate between multiple AMSTAR 2 checklists for different reviews.
- Fill out the full AMSTAR 2 checklist for a review
- Save and load your checklists automatically in your browser
- Can work fully offline—no internet connection required after first load
- Sync project with team when internet connection is back
- RESTful API for checklist management
- Database persistence with PostgreSQL
- Automatic database migrations with Alembic

## Planned Features

- **Checklist Merging:** Compare and merge two AMSTAR 2 checklists into a final checklist.
- **Import/Export CSV:** Import a checklist from a CSV file or export a checklist(s) to share.
- **Better Mobile Compatibility:** Make it look nice and usable on mobile.
- **Improved Accessibility:** Make it more accessible.
- **Collaborate realtime:** Collaborate on checklists in real time.
- **Upload Review PDF:** Upload and view a Review PDF alongside, above, or underneath the checklist.
- **Integration with Reference Managers:** Import studies from Zotero, EndNote, and others.

### Backend Development

The backend is a FastAPI application with the following components:

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **PostgreSQL**: Production-ready database
- **Pydantic**: Data validation using Python type hints

### API Documentation

When the backend is running, visit http://localhost:8000/docs for interactive API documentation powered by Swagger UI.

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
- **Port**: 5433
- **Database**: amstar
- **Username**: amstar
- **Password**: amstar_password

#### Connect to Database

```bash
# Using Docker
docker-compose exec db psql -U amstar -d amstar

# Host: localhost, Port: 5433
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

---
