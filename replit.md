# Overview

This is a full-stack web application that processes academic question papers using OCR (Optical Character Recognition) and generates AI-powered solutions. The system allows users to upload images of question papers or input text directly, extracts text from images, and generates comprehensive solutions using AI language models. Built with a modern React frontend and Express.js backend, the application features a clean, responsive UI with dark theme support and smooth animations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18+ with TypeScript and Vite for fast development and building
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth transitions and loading states
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with structured error handling and request logging
- **File Processing**: Multer for multipart file uploads with memory storage
- **Image Processing**: Sharp for image preprocessing (grayscale, normalization, sharpening)
- **OCR Engine**: Tesseract.js for client-side text extraction from images
- **Validation**: Zod schemas for request/response validation shared between client and server

## Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Connection**: Neon Database serverless PostgreSQL adapter for cloud deployment
- **Session Storage**: In-memory storage with fallback to PostgreSQL for question sessions
- **File Storage**: Memory-based file handling for temporary image processing

## Key Features Implementation
- **OCR Processing**: Multi-step image preprocessing pipeline (grayscale → normalize → sharpen) before text extraction
- **AI Integration**: Structured for external AI service integration (OpenRouter/OpenAI) for solution generation
- **Responsive Design**: Mobile-first approach with adaptive layouts using Tailwind breakpoints
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages with toast notifications
- **Loading States**: Animated loading spinners and skeleton components for better UX

## Development Tooling
- **Build System**: Vite with hot module replacement and optimized production builds
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Asset Management**: Public asset serving with proper MIME type handling
- **Development Server**: Integrated Vite development server with Express API proxy

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **express**: Web application framework for Node.js
- **tesseract.js**: OCR engine for text extraction from images
- **sharp**: High-performance image processing library

## UI and Styling Libraries
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **framer-motion**: Production-ready motion library for React animations
- **class-variance-authority**: Utility for creating component variants
- **clsx**: Conditional className utility

## Development and Build Tools
- **vite**: Next-generation frontend build tool with fast HMR
- **typescript**: Static type checking for JavaScript
- **@vitejs/plugin-react**: React support for Vite
- **esbuild**: Fast JavaScript bundler for production builds

## Data Management
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Performant forms with easy validation
- **zod**: TypeScript-first schema validation
- **wouter**: Minimalist routing for React applications

## Potential Future Integrations
- **OpenRouter/OpenAI API**: For AI-powered solution generation
- **Cloud Storage**: For persistent file storage (AWS S3, Cloudinary)
- **Authentication Services**: For user management and session handling
- **Payment Processing**: For premium features (Stripe integration ready)