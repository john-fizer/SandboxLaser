# Job Tracking Dashboard - Project Outline

## File Structure

```
/mnt/okcomputer/output/
├── index.html              # Main dashboard page
├── main.js                 # Core application logic
├── resources/              # Assets folder
│   ├── hero-bg.jpg        # Industrial background image
│   ├── factory-icon.png   # Manufacturing themed icon
│   └── pattern-bg.png     # Subtle background pattern
├── interaction.md          # Interaction design document
├── design.md              # Visual style guide
└── outline.md             # This project outline
```

## Component Architecture

### 1. index.html - Main Dashboard Layout
**Purpose**: Single-page application structure with three-column layout
**Sections**:
- **Header**: App title, mode toggle, job statistics
- **Main Content**: Three columns (Queued, Processing, Done)
- **Job Detail Modal**: Overlay for viewing/editing job details
- **Footer**: Simple copyright information

**Key Elements**:
- Responsive grid layout using CSS Grid/Flexbox
- Column headers with job count badges
- Drag-and-drop zones for each column
- Mode toggle switch (Mode 1/Mode 2)

### 2. main.js - Application Logic
**Purpose**: State management, interactions, and data handling

**Core Classes/Functions**:

#### JobManager Class
- **State Management**: Centralized job data storage
- **Methods**:
  - `addJob(jobData)` - Add new job to system
  - `updateJobStatus(jobId, newStatus)` - Change job status
  - `getJobsByStatus(status)` - Filter jobs by status
  - `saveState()` - Persist data to localStorage
  - `loadState()` - Restore data from localStorage

#### DragDropHandler Class
- **Drag and Drop Logic**: HTML5 Drag and Drop API implementation
- **Methods**:
  - `handleDragStart(event)` - Initialize drag operation
  - `handleDragOver(event)` - Manage drag over zones
  - `handleDrop(event)` - Process job status change
  - `showDropFeedback(column)` - Visual feedback during drag

#### UIRenderer Class
- **UI Updates**: Dynamic content rendering
- **Methods**:
  - `renderJobCard(job)` - Generate job card HTML
  - `renderColumns()` - Update all three columns
  - `updateJobCounts()` - Refresh column badges
  - `showJobModal(job)` - Display job detail modal
  - `toggleMode(mode)` - Switch between Mode 1/Mode 2

#### ModeController Class
- **Mode Management**: Handle Mode 1/Mode 2 switching
- **Methods**:
  - `setMode(mode)` - Update application mode
  - `applyModeStyles()` - Change visual styling
  - `updateModeFeatures()` - Enable/disable features
  - `getCurrentMode()` - Return current mode

### 3. Mock Data Structure

#### Job Object Schema
```javascript
{
  id: "unique-job-id",
  customer: "Customer Name",
  partNumber: "PART-12345",
  jobNumber: "JOB-2026-001",
  quantity: 100,
  dueDate: "2026-01-15",
  status: "queued|processing|done",
  priority: "high|medium|low",
  notes: "Optional job notes",
  createdAt: "2026-01-07T10:00:00Z",
  updatedAt: "2026-01-07T10:00:00Z"
}
```

#### Sample Jobs (15+ entries)
- Mix of customers (Acme Manufacturing, TechCorp, Industrial Solutions, etc.)
- Various part numbers and quantities
- Different due dates (some overdue for testing)
- All three status types represented

### 4. Interactive Features Implementation

#### Drag and Drop System
- **HTML5 Drag and Drop API**: Native browser support
- **Visual Feedback**: Opacity changes, drop zone highlighting
- **Data Transfer**: Job ID stored in drag data
- **Validation**: Prevent invalid status transitions

#### Mode Toggle System
- **Mode 1 (Operations)**: Standard view, drag-drop enabled
- **Mode 2 (Supervisor)**: Enhanced metadata, overdue highlighting
- **State Persistence**: Mode preference saved to localStorage
- **Dynamic Styling**: CSS class changes for visual differences

#### Job Detail Modal
- **Modal Structure**: Overlay with backdrop blur
- **Content Sections**: Job info, customer details, timeline
- **Edit Capability**: Inline editing for certain fields
- **Validation**: Form validation for edited data

### 5. Responsive Design Strategy

#### Breakpoints
- **Mobile (<768px)**: Single column stack, touch-optimized
- **Tablet (768px-1024px)**: Two column layout, swipe navigation
- **Desktop (>1024px)**: Three column layout, full features

#### Mobile Adaptations
- **Touch Targets**: Minimum 44px for all interactive elements
- **Swipe Gestures**: Horizontal swipe between columns
- **Simplified UI**: Reduced metadata, larger text
- **Performance**: Optimized animations for mobile devices

### 6. Visual Effects Integration

#### Animation Libraries
- **Anime.js**: Card movements, state transitions
- **Splitting.js**: Header text effects
- **ECharts.js**: Job distribution charts
- **Pixi.js**: Subtle background particle effects

#### Effect Implementation
- **Card Animations**: Smooth drag with physics-based movement
- **State Transitions**: Color morphing when status changes
- **Loading States**: Skeleton screens and progress indicators
- **Micro-interactions**: Button hover, form focus states

### 7. Data Persistence

#### localStorage Schema
```javascript
{
  jobs: [/* array of job objects */],
  mode: "mode1|mode2",
  lastUpdated: "timestamp",
  userPreferences: {
    /* user-specific settings */
  }
}
```

#### State Management
- **Initial Load**: Restore from localStorage or use mock data
- **Auto-Save**: Debounced save after each change
- **Version Control**: Handle data schema migrations
- **Error Handling**: Graceful fallback for corrupted data

This architecture provides a solid foundation for a professional job tracking dashboard with all requested features and room for future expansion.