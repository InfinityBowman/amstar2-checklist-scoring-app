# Frontend Roadmap

- [ ] **Navbar**
  - [ ] Add a top navigation bar to all pages
  - [ ] Show app name/logo
  - [ ] Add login/logout button (integrate with authentication)

- [ ] **Authentication**
  - [ ] Integrate login/logout flow (Supabase)
  - [ ] Show/hide features based on authentication state

- [ ] **Landing Page + Homepage**
  - [ ] Create a welcoming landing page
  - [ ] Show app description and quick start
  - [ ] Show login/register prompt if not logged in
  - [ ] Show recent projects/checklists if logged in

- [ ] **Create Project Page**
  - [ ] Form to create a new project (name, description, etc.)
  - [ ] Optionally make the project collaborative (must be logged in)
  - [ ] Optionally add collaborators (must be a collaborative project and logged in)
  - [ ] Need some way to search for existing users
  - [ ] Add project to user’s project list

- [ ] **User Profile/Settings Page**
  - [ ] Change name/settings etc.

- [ ] **Checklist Merge Editor**
  - [ ] Compare two checklists in a merge editor
  - [ ] Optionally make merge editor collaborative

- [ ] **Project Dashboard**
  - [ ] Export data visualization in color or greyscale
  - [ ] Data visualizations for all checklists in a project

- [ ] **Sidebar**
  - [x] List projects and their checklists (expandable/collapsible)
  - [ ] Updating checklist data should update the sidebar

- [ ] **PDF Viewer**
  - [ ] View PDFs and search through them

- [ ] **Testing**
  - [ ] Vitest for testing

- [ ] **Analytics**
  - [ ] Analytics monitoring, posthog or do it manually and store in supabase?

Use Server-Sent Events (EventSource api) for server driven updates
Zustand for state management or just solid signals?

---

_This roadmap is a living document and will be updated as the project evolves._
