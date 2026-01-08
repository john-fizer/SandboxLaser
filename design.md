# Job Tracking Dashboard - Design Style Guide

## Design Philosophy

### Visual Language
- **Industrial Professional**: Clean, functional design optimized for shop-floor environments
- **High Readability**: Clear typography and strong contrast for various lighting conditions
- **Minimal Clutter**: Focus on essential information, reduce cognitive load
- **Status-Driven**: Visual hierarchy emphasizes job status and priorities

### Color Palette
- **Primary Blue**: #1e40af (links, buttons, queued jobs)
- **Amber**: #f59e0b (processing jobs, warnings)
- **Green**: #10b981 (completed jobs, success states)
- **Red**: #ef4444 (overdue jobs, errors)
- **Neutral Gray**: #64748b (text, borders, inactive elements)
- **Light Gray**: #f8fafc (backgrounds, cards)
- **Dark Gray**: #1f2937 (text, headers)

### Typography
- **Primary Font**: Inter (clean, highly legible sans-serif)
- **Headers**: Inter Bold, 24px-32px
- **Job Cards**: Inter Medium, 14px-16px
- **Body Text**: Inter Regular, 14px
- **Small Text**: Inter Regular, 12px

## Visual Effects & Styling

### Used Libraries
- **Anime.js**: Smooth drag-and-drop animations and state transitions
- **Splitting.js**: Text animation effects for headers
- **ECharts.js**: Job distribution charts and analytics
- **Pixi.js**: Particle effects for background (subtle industrial theme)

### Animation & Effects
- **Drag Animations**: Smooth card movement with opacity changes
- **State Transitions**: Color transitions when jobs change status
- **Loading States**: Subtle pulse animations for data loading
- **Hover Effects**: Gentle lift and shadow for interactive elements

### Header Effect
- **Industrial Background**: Subtle geometric pattern with manufacturing elements
- **Gradient Overlay**: Dark blue to gray gradient for professional look
- **Animated Particles**: Minimal particle system suggesting factory automation

### Card Design
- **Job Cards**: Clean white background with colored left border indicating status
- **Shadow**: Subtle drop shadow (0 2px 4px rgba(0,0,0,0.1))
- **Border Radius**: 8px for modern, friendly appearance
- **Typography Hierarchy**: Customer name largest, job details smaller

### Column Styling
- **Column Headers**: Bold text with job count badges
- **Background**: Light gray (#f8fafc) with subtle texture
- **Drop Zones**: Highlighted border when dragging over
- **Scroll Areas**: Custom scrollbar for better aesthetics

### Interactive Elements
- **Buttons**: Rounded corners, hover states with color transitions
- **Toggle Switch**: Custom styled with smooth animation
- **Modal**: Backdrop blur effect, slide-in animation
- **Form Inputs**: Clean borders, focus states with blue accent

### Mobile Responsive Design
- **Breakpoints**: 
  - Mobile: <768px (single column stack)
  - Tablet: 768px-1024px (two column layout)
  - Desktop: >1024px (three column layout)
- **Touch Targets**: Minimum 44px for mobile interaction
- **Typography Scaling**: Responsive font sizes

### Professional Touches
- **Consistent Spacing**: 8px grid system throughout
- **Icon System**: Consistent iconography for actions and status
- **Loading States**: Skeleton screens for data loading
- **Error States**: Clear, helpful error messaging
- **Empty States**: Informative illustrations for no data scenarios

## Component Styling Specifications

### Job Card
- **Dimensions**: 280px width, min 120px height
- **Padding**: 16px all sides
- **Border**: 1px solid #e2e8f0
- **Status Border**: 4px left border in status color
- **Typography**: Customer (16px bold), Part Number (14px), Job Details (12px)

### Column Layout
- **Container**: Max-width 1400px, centered
- **Gaps**: 24px between columns
- **Column Width**: Flexible (1fr each)
- **Header Height**: 60px with centered text and badge

### Mode Toggle
- **Style**: Custom switch with Mode 1/Mode 2 labels
- **Animation**: Smooth slide transition
- **Colors**: Blue for active state, gray for inactive

### Detail Modal
- **Width**: 500px max-width
- **Backdrop**: rgba(0,0,0,0.5) with blur
- **Animation**: Slide up from bottom
- **Content**: Structured form layout with clear sections

This design system ensures a cohesive, professional appearance that works well in manufacturing environments while maintaining modern web standards and excellent user experience.