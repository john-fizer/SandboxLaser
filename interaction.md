# Job Tracking Dashboard - Interaction Design

## Core Interaction Flow

### Dashboard Overview
- **Three-Column Layout**: Queued (left), Processing (center), Done (right)
- **Color Coding**: 
  - Queued: Blue-gray (#64748b)
  - Processing: Amber (#f59e0b)
  - Done: Green (#10b981)
- **Mode Toggle**: Switch between Mode 1 (Operations) and Mode 2 (Supervisor/Planning)

### Job Card Interactions

#### 1. Job Card Display
Each card shows:
- Customer name (prominent)
- Part Number (secondary)
- Job Number (small, top-right)
- Quantity (bold)
- Due Date (with overdue highlighting)

#### 2. Click to View Details
- Click any job card to open detailed view modal
- Modal shows complete job information
- Edit capability for certain fields
- Close with X button or click outside

#### 3. Drag and Drop Between Columns
- Drag job cards between Queued → Processing → Done
- Visual feedback during drag (opacity change, drop zone highlighting)
- Status updates automatically on drop
- Smooth animation transitions

#### 4. Overdue Job Highlighting
- Due dates in past shown with red border/background
- Warning icon for overdue jobs
- Mode 2: Enhanced overdue highlighting with priority indicators

### Mode Toggle Behavior

#### Mode 1 - Operations View
- Standard job flow focus
- Drag-and-drop enabled
- Basic job information display
- Auto-progression allowed

#### Mode 2 - Supervisor/Planning View
- Enhanced metadata display
- Additional job details visible
- Overdue jobs prominently highlighted
- Manual controls for job progression
- Planning-specific information
- Can lock job movement (optional)

### Data State Management
- All interactions update central state object
- Mock data includes 15+ sample jobs across all stages
- State persists during session
- Clear data structure for easy API integration

### Mobile Responsive Behavior
- Columns stack vertically on mobile
- Touch-friendly drag and drop
- Swipe gestures for column navigation
- Optimized card sizes for touch

### Interactive Components

1. **Job Cards**: Draggable, clickable, status-indicating
2. **Mode Toggle**: Immediate UI state change
3. **Detail Modal**: View/edit job information
4. **Column Headers**: Show job counts per stage
5. **Overdue Indicators**: Visual warnings for past due dates

### User Workflow Examples

#### Basic Job Progression:
1. New job appears in Queued column
2. Operator drags job to Processing when work begins
3. Job gets amber/yellow styling in Processing
4. When complete, drag to Done column
5. Job gets green styling in Done

#### Supervisor Review (Mode 2):
1. Toggle to Mode 2
2. See enhanced job details and overdue highlights
3. Review job priorities and planning information
4. Make manual adjustments if needed
5. Toggle back to Mode 1 for operations

### Technical Interaction Notes
- State-driven architecture using vanilla JavaScript
- Drag and drop using HTML5 Drag and Drop API
- Local storage for session persistence
- Modular component structure
- Event-driven updates for real-time feel