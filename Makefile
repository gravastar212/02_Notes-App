# Notes App - Development Makefile
# Provides convenient commands for local development

.PHONY: help install dev build test lint clean setup-db migrate seed

# Default target
help: ## Show this help message
	@echo "Notes App - Development Commands"
	@echo "================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation commands
install: ## Install all dependencies (root, backend, frontend)
	@echo "📦 Installing root dependencies..."
	npm install
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed!"

install-backend: ## Install backend dependencies only
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install

install-frontend: ## Install frontend dependencies only
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install

# Development commands
dev: ## Start both backend and frontend in development mode
	@echo "🚀 Starting development servers..."
	@echo "Backend: http://localhost:4000"
	@echo "Frontend: http://localhost:3000"
	@echo "Health Check: http://localhost:4000/health"
	@echo ""
	@echo "Press Ctrl+C to stop all servers"
	@echo ""
	@trap 'kill %1 %2' INT; \
	cd backend && npm run dev & \
	cd frontend && npm run dev & \
	wait

dev-backend: ## Start backend development server only
	@echo "🚀 Starting backend development server..."
	@echo "Backend: http://localhost:4000"
	@echo "Health Check: http://localhost:4000/health"
	cd backend && npm run dev

dev-frontend: ## Start frontend development server only
	@echo "🚀 Starting frontend development server..."
	@echo "Frontend: http://localhost:3000"
	cd frontend && npm run dev

# Build commands
build: ## Build both backend and frontend for production
	@echo "🔨 Building backend..."
	cd backend && npm run build
	@echo "🔨 Building frontend..."
	cd frontend && npm run build
	@echo "✅ Build complete!"

build-backend: ## Build backend only
	@echo "🔨 Building backend..."
	cd backend && npm run build

build-frontend: ## Build frontend only
	@echo "🔨 Building frontend..."
	cd frontend && npm run build

# Testing commands
test: ## Run all tests (backend and frontend)
	@echo "🧪 Running backend tests..."
	cd backend && npm test
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test
	@echo "✅ All tests completed!"

test-backend: ## Run backend tests only
	@echo "🧪 Running backend tests..."
	cd backend && npm test

test-frontend: ## Run frontend tests only
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test

test-watch: ## Run frontend tests in watch mode
	@echo "🧪 Running frontend tests in watch mode..."
	cd frontend && npm run test:watch

test-coverage: ## Run frontend tests with coverage
	@echo "🧪 Running frontend tests with coverage..."
	cd frontend && npm run test:coverage

# Linting commands
lint: ## Run linting for both backend and frontend
	@echo "🔍 Linting backend..."
	cd backend && npm run lint
	@echo "🔍 Linting frontend..."
	cd frontend && npm run lint
	@echo "✅ Linting complete!"

lint-fix: ## Fix linting issues for both backend and frontend
	@echo "🔧 Fixing backend linting issues..."
	cd backend && npm run lint:fix
	@echo "🔧 Fixing frontend linting issues..."
	cd frontend && npm run lint:fix
	@echo "✅ Linting fixes complete!"

lint-backend: ## Run backend linting only
	@echo "🔍 Linting backend..."
	cd backend && npm run lint

lint-frontend: ## Run frontend linting only
	@echo "🔍 Linting frontend..."
	cd frontend && npm run lint

# Database commands
setup-db: ## Set up database (generate Prisma client and run migrations)
	@echo "🗄️ Setting up database..."
	cd backend && npm run prisma:generate
	cd backend && npm run prisma:migrate
	@echo "✅ Database setup complete!"

migrate: ## Run database migrations
	@echo "🗄️ Running database migrations..."
	cd backend && npm run prisma:migrate
	@echo "✅ Migrations complete!"

migrate-reset: ## Reset database (WARNING: This will delete all data!)
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@echo "🗄️ Resetting database..."
	cd backend && npm run prisma:reset
	@echo "✅ Database reset complete!"

seed: ## Seed database with sample data
	@echo "🌱 Seeding database..."
	cd backend && npm run db:seed
	@echo "✅ Database seeded!"

db-studio: ## Open Prisma Studio
	@echo "🗄️ Opening Prisma Studio..."
	cd backend && npm run prisma:studio

# Type checking
type-check: ## Run TypeScript type checking for both backend and frontend
	@echo "🔍 Type checking backend..."
	cd backend && npm run type-check
	@echo "🔍 Type checking frontend..."
	cd frontend && npm run type-check
	@echo "✅ Type checking complete!"

# Cleanup commands
clean: ## Clean all build artifacts and node_modules
	@echo "🧹 Cleaning build artifacts..."
	cd backend && npm run clean
	cd frontend && rm -rf .next
	@echo "🧹 Cleaning node_modules..."
	rm -rf node_modules
	cd backend && rm -rf node_modules
	cd frontend && rm -rf node_modules
	@echo "✅ Cleanup complete!"

clean-build: ## Clean build artifacts only
	@echo "🧹 Cleaning build artifacts..."
	cd backend && npm run clean
	cd frontend && rm -rf .next
	@echo "✅ Build artifacts cleaned!"

# Environment setup
setup-env: ## Copy environment template files
	@echo "📋 Setting up environment files..."
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "✅ Created backend/.env from template"; \
	else \
		echo "⚠️  backend/.env already exists"; \
	fi
	@if [ ! -f frontend/.env.local ]; then \
		cp frontend/.env.example frontend/.env.local; \
		echo "✅ Created frontend/.env.local from template"; \
	else \
		echo "⚠️  frontend/.env.local already exists"; \
	fi
	@echo "📝 Please update the environment files with your configuration"

# Quick start for new developers
quickstart: setup-env install setup-db dev ## Complete setup for new developers

# Production commands
start: ## Start production servers
	@echo "🚀 Starting production servers..."
	@echo "Backend: http://localhost:4000"
	@echo "Frontend: http://localhost:3000"
	@trap 'kill %1 %2' INT; \
	cd backend && npm start & \
	cd frontend && npm start & \
	wait

# Health check
health: ## Check if servers are running
	@echo "🏥 Checking server health..."
	@curl -s http://localhost:4000/health > /dev/null && echo "✅ Backend is healthy" || echo "❌ Backend is not responding"
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend is healthy" || echo "❌ Frontend is not responding"
