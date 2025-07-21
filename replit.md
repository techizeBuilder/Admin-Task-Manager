# TaskSetu - Team Management & Task Tracking Application

## Overview

TaskSetu is a comprehensive team management and task tracking application built with a modern JavaScript stack. It provides multi-tenant organization management, role-based access control, user invitation systems, and task management capabilities. The application supports both individual users and organizational teams with different permission levels.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for development and building
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Email Service**: Nodemailer with Mailtrap for email delivery
- **File Structure**: Modular architecture with separate services, models, and routes

### Data Storage Solutions
- **Primary Database**: MongoDB Atlas cluster for production data
- **Schema Design**: Mongoose schemas for Organizations, Users, Projects, Tasks, Forms, and Process Flows
- **Session Management**: JWT tokens with role-based permissions
- **File Storage**: Local storage with configurable paths

## Key Components

### Authentication System
- Multi-role authentication (super_admin, org_admin, employee, individual)
- Email verification workflow for new user registration
- Password reset functionality with secure token generation
- Invitation system for organization members
- Role-based access control with middleware protection

### Organization Management
- Multi-tenant architecture supporting multiple organizations
- Organization-specific user management and permissions
- Configurable organization settings and branding
- License and subscription management

### User Management
- Comprehensive user profiles with role assignments
- Invitation workflow with email notifications
- User status tracking (active, invited, pending verification)
- Organization membership management

### Task Management
- Project-based task organization
- Task assignment and status tracking
- Comments and audit logging
- Priority levels and due date management

### Form Builder & Process Flow
- Dynamic form creation with custom fields
- Process workflow management
- Form response collection and analysis
- Integration with task management system

## Data Flow

### User Registration Flow
1. User initiates registration (individual or organization)
2. Email verification token generated and sent
3. User verifies email through secure link
4. Account activated and user can login

### Invitation Flow
1. Organization admin invites user via email
2. Invitation token generated with expiration
3. Invited user receives email with secure acceptance link
4. User completes profile setup and joins organization

### Authentication Flow
1. User submits login credentials
2. Server validates credentials and generates JWT token
3. Token includes user ID, role, and organization information
4. Client stores token and includes in API requests
5. Server middleware validates token on protected routes

## External Dependencies

### Email Services
- **Mailtrap**: Development email testing service
- **SendGrid**: Production email delivery (optional)
- **Nodemailer**: Email sending library with SMTP support

### Database Services
- **MongoDB Atlas**: Cloud-hosted MongoDB database
- **Mongoose**: MongoDB object modeling for Node.js

### Authentication Libraries
- **bcryptjs**: Password hashing and verification
- **jsonwebtoken**: JWT token generation and verification
- **crypto**: Secure token generation for verification codes

### Frontend Libraries
- **React Query**: Server state management and caching
- **Radix UI**: Accessible UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development Environment
- **Local Development**: Node.js server with MongoDB connection
- **Hot Reloading**: Vite development server with HMR
- **Environment Variables**: Local .env file configuration

### Production Environment
- **Platform**: Replit deployment with autoscale configuration
- **Build Process**: Vite build for client, esbuild for server bundling
- **Database**: MongoDB Atlas cluster with connection pooling
- **Email**: Mailtrap for development, configurable for production services

### Environment Configuration
- **Database URL**: MongoDB connection string with authentication
- **JWT Secret**: Secure secret key for token signing
- **Email Credentials**: SMTP configuration for email services
- **Base URL**: Configurable base URL for email links

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

Latest updates:
- July 21, 2025: Successfully migrated TaskSetu from Replit Agent to Replit environment
- July 21, 2025: Integrated comprehensive task API with MongoDB storage for all task types
- July 21, 2025: Updated CreateTask and ApprovalTaskCreator components to use React Hook Form
- July 21, 2025: Fixed organization validation to support both individual users and organization members
- July 21, 2025: Configured authentication-protected endpoints with file upload support
- July 21, 2025: **COMPLETED** - Advanced task creation system with full field support:
  * All task types (regular, recurring, milestone, approval) working
  * Category field saving properly for all task forms
  * Multiple dependencies support in advanced settings  
  * Reference process and custom form linking implemented
  * Task type classification (simple/complex/recurring/milestone/approval)
  * Comprehensive MongoDB schema with all advanced fields
  * Individual and organization user support verified
- July 21, 2025: **NEW** - Task Type-Specific API System Implemented:
  * Created dedicated `/api/tasks` endpoint for type-specific task creation
  * Built task validation system with field filtering for each task type
  * Added complete CRUD operations with proper MongoDB enum mapping
  * Implemented taskTypeApi.js frontend library for easy API integration
  * Added TaskTypeDemo component for testing all task types
  * Fixed task type mapping (simple -> regular) for MongoDB compatibility
- July 21, 2025: **UPDATED** - Simple Task Fields Specification Completed:
  * Implemented exact Simple Task fields as per user requirements:
    - Basic: Title, Description, Assign to, Priority, Category, Initial Status, Due Date, Tags, Attachments
    - Advanced Options: Reference Process, Custom Form, Dependencies, Task Type
  * Fixed MongoDB validation issues for visibility and approval mode enums
  * Updated TaskTypeDemo with Simple Task advanced options form fields
  * All task creation and retrieval working correctly with proper field validation

## Changelog

Changelog:
- June 14, 2025: Initial setup
- July 21, 2025: Migration to Replit completed with full API integration