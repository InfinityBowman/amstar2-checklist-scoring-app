# Frontend Roadmap

- [ ] **Navbar**
  - [x] Add a top navigation bar to all pages
  - [x] Show app name/logo
  - [ ] Add login/logout button (integrate with authentication)

- [ ] **Authentication**
  - [ ] Integrate login/logout flow
  - [ ] Use HttpOnly cookies and refresh token
  - [ ] Show/hide features based on authentication state

- [ ] **Landing Page**
  - [ ] Create a welcoming landing page
  - [ ] Show app description
  - [ ] Show login/register prompt
  - [ ] Maybe link to an about page
  - [ ] This page should be statically rendered and function perfectly if JavaScript is disabled

- [ ] **Create Project Page**
  - [ ] Form to create a new project (name, description, etc.)
  - [ ] Optionally make the project collaborative (must be logged in)
  - [ ] Optionally add collaborators (must be a collaborative project and logged in)
  - [ ] Need some way to search for existing users
  - [ ] Add project to user’s project list

- [ ] **User Profile/Settings Page**
  - [ ] Change name/settings etc.

- [ ] **AMSTAR 2 Checklists**
  - [ ] Optionally make merge editor collaborative
  - [ ] Import/Export checklists to/from CSV
  - [ ] Customize critical/noncritical items for scoring
  - [x] Automatic saving
  - [x] Automatic yes/partial yes/no based on answers

  - [ ] **Merge Editor**
  - [ ] Compare two checklists in a merge editor

- [ ] **Project Dashboard**
  - [ ] Export data visualization in color or greyscale
  - [ ] Data visualizations for all checklists in a project
  - [ ] Import/Export project to/from CSV

- [x] **Sidebar**
  - [x] List projects and their checklists (expandable/collapsible)
  - [x] Updating checklist data should update the sidebar

- [ ] **PDF Viewer**
  - [ ] View PDFs and search through them

- [ ] **Testing**
  - [ ] Vitest for testing

- [ ] **Analytics**
  - [ ] Analytics monitoring, posthog or do it manually and store in supabase?

- [ ] **Helper Popover**
  - [ ] ? icon that we can place to give users tips/info about things
  - [ ] Make these hide-able in settings
  - [ ] Ex: What does it mean for something to be a critical item

- [ ] **Misc**
- [ ] Use Server-Sent Events (EventSource api) for server driven updates
- [ ] Use solid router to control navigation between checklists, projects, etc.
  - makes it so back and forward buttons work properly
- [ ] Better loading components
- [ ] Improve URL to be like /project/projectName/checklist/checklistName
- [ ] Icons: https://solid-icons.vercel.app/
- [ ] UI library: https://zagjs.com/overview/installation

_This roadmap is a living document and will be updated as the project evolves._
