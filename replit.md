# TaskSetu - Team Management & Task Tracking Application

## Overview

TaskSetu is a comprehensive, multi-tenant team management and task tracking application. It provides robust features for organization management, role-based access control, user invitations, and diverse task management capabilities, supporting both individual users and organizational teams with varying permission levels. The project aims to streamline team collaboration and productivity through an intuitive and feature-rich platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture (Updated September 2025)
- **Framework**: React with Vite
- **Routing**: Wouter
- **State Management**: React Query (@tanstack/react-query)
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with a custom design system
- **Forms**: React Hook Form with validation
- **Architecture Pattern**: Feature-based organization for scalability

### New Feature-Based Structure
```
client/src/features/
├── shared/              # Shared components, hooks, and utilities
│   ├── components/      # Reusable UI components  
│   ├── hooks/          # Custom React hooks (useAuth, useRole, useFeaturePermissions)
│   ├── services/       # API service functions
│   └── utils/          # Utility functions
├── dashboard/          # Dashboard feature with role-specific pages
├── tasks/              # Task management with recurring tasks support  
├── calendar/           # Calendar integration (prepared for future)
└── auth/               # Authentication feature
```

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt hashing
- **Email Service**: Nodemailer
- **Mock API**: json-server with Zod validation for development
- **File Structure**: Modular architecture (services, models, routes)

### Data Storage Solutions
- **Primary Database**: MongoDB Atlas
- **Schema Design**: Mongoose schemas for Organizations, Users, Projects, Tasks, Forms, and Process Flows
- **Session Management**: JWT tokens with role-based permissions
- **File Storage**: Local storage

### Key Features & Implementations
- **Authentication System**: Multi-role authentication (super_admin, org_admin, employee, individual), email verification, password reset, invitation system, role-based access control.
- **Organization Management**: Multi-tenant support, organization-specific user management, configurable settings, license/subscription management.
- **User Management**: Comprehensive user profiles, invitation workflows, status tracking.
- **Task Management**: Project-based organization, assignment, status tracking, comments, audit logging, priority levels, due dates. Supports regular, recurring, milestone, and approval task types with extensive fields (dependencies, reference processes, custom forms).
- **Task-Specific Creation Drawers**: Reusable TaskDrawer component with task-type-specific forms (QuickTaskForm, RegularTaskForm, MilestoneTaskForm, ApprovalTaskForm) for maintainable code. Auto-opening when navigating from submenu routes with green gradient headers and card-based separation styling.
- **AllTasks Professional Interface**: Complete task management table with filtering by task type, search, status filters, bulk actions, and export capabilities. Supports type-specific filtering for specialized views (quick tasks only, milestones only, etc.).
- **Recurring Tasks System**: Full recurring task management with frequency scheduling (daily, weekly, monthly), template management, active/paused status control, and Individual user focus.
- **Form Builder & Process Flow**: Dynamic form creation, workflow management, response collection, integration with task management.
- **Dashboard System**: Comprehensive, role-based dashboards (Individual, Organization, SuperAdmin) with dynamic navigation and real API integration.
- **Mock API Backend**: Complete json-server setup with Zod validation, realistic sample data, and authentic API endpoints for development.
- **Sidebar System**: Unified, dynamic, role-based sidebar with submenu navigation for task types (Create Task, Quick Tasks, Milestones, Approvals), role mapping for backend integration and mobile responsiveness.
- **Feature-Based Architecture**: Scalable folder structure organized by business features (dashboard, tasks, calendar, auth) with shared components and role-based permissions.
- **Avatar System**: Consistent avatar display across the application with priority-based image loading and real-time updates.
- **Email Templates**: Differentiated designs for organization vs. individual registration.
- **Form Validations**: Comprehensive inline validation, rate limiting, and improved error handling for user-facing forms (e.g., login, registration, password reset).

## External Dependencies

- **Email Services**: Mailtrap (development), Nodemailer
- **Database Services**: MongoDB Atlas, Mongoose
- **Authentication Libraries**: bcryptjs, jsonwebtoken, crypto
- **Frontend Libraries**: React Query, Radix UI, Tailwind CSS, Lucide React