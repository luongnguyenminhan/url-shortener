.PHONY: help build build-push update-runtime-be update-runtime-fe up restart rebuild down logs ps env-check

# Variables
REGISTRY :=
DOCKERHUB_REGISTRY := luongnguyenminhan
IMAGE_NAME := urls
DOCKER_BUILD_FLAGS := 

# Local images
BACKEND_RUNTIME_IMAGE := $(IMAGE_NAME):backend-runtime
BACKEND_APP_IMAGE := $(IMAGE_NAME):backend

# Frontend images
FRONTEND_RUNTIME_IMAGE := $(IMAGE_NAME):frontend-runtime
FRONTEND_APP_IMAGE := $(IMAGE_NAME):frontend

# Docker Hub images
DOCKERHUB_BACKEND_RUNTIME := $(DOCKERHUB_REGISTRY)/url-shortener:backend-runtime
DOCKERHUB_BACKEND_APP := $(DOCKERHUB_REGISTRY)/url-shortener:backend
DOCKERHUB_FRONTEND_RUNTIME := $(DOCKERHUB_REGISTRY)/url-shortener:frontend-runtime
DOCKERHUB_FRONTEND_APP := $(DOCKERHUB_REGISTRY)/url-shortener:frontend

## help: Display this help message
help:
	@echo "Available targets:"
	@echo ""
	@sed -n 's/^## //p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Examples:"
	@echo "  make build              - Build app images (requires runtime images)"
	@echo "  make build-push         - Build and push app images to Docker Hub"
	@echo "  make update-runtime-be  - Build and push backend runtime to Docker Hub (dev & prod) - Required before CI deployment"
	@echo "  make update-runtime-fe  - Build and push frontend runtime to Docker Hub (dev & prod) - Required before CI deployment"
	@echo "  make up                 - Start all services"
	@echo "  make restart            - Restart all services"
	@echo "  make rebuild            - Rebuild app images and restart services"

## build: Build app images (backend & frontend) - requires runtime images to exist
build:
	@echo "🔨 Building app images..."
	@docker image inspect $(BACKEND_RUNTIME_IMAGE) >/dev/null 2>&1 || (echo "❌ Backend runtime image $(BACKEND_RUNTIME_IMAGE) does not exist. Run 'make update-runtime-be' first." && exit 1)
	@docker image inspect $(FRONTEND_RUNTIME_IMAGE) >/dev/null 2>&1 || (echo "❌ Frontend runtime image $(FRONTEND_RUNTIME_IMAGE) does not exist. Run 'make update-runtime-fe' first." && exit 1)
	docker build $(DOCKER_BUILD_FLAGS) \
		-f Backend/build/Dockerfile.app \
		--build-arg RUNTIME_IMAGE=$(BACKEND_RUNTIME_IMAGE) \
		-t $(BACKEND_APP_IMAGE) \
		Backend/
	docker build $(DOCKER_BUILD_FLAGS) \
		-f Frontend/Dockerfile.app \
		--build-arg RUNTIME_IMAGE=$(FRONTEND_RUNTIME_IMAGE) \
		-t $(FRONTEND_APP_IMAGE) \
		Frontend/
	@echo "✅ App images built successfully!"

## build-push: Build app images and push to Docker Hub
build-push: build
	@echo "📤 Pushing app images to Docker Hub..."
	docker tag $(BACKEND_APP_IMAGE) $(DOCKERHUB_BACKEND_APP) && docker push $(DOCKERHUB_BACKEND_APP)
	docker tag $(FRONTEND_APP_IMAGE) $(DOCKERHUB_FRONTEND_APP) && docker push $(DOCKERHUB_FRONTEND_APP)
	@echo "✅ App images pushed to Docker Hub successfully!"

## update-runtime-be: Build and push backend runtime image to Docker Hub (dev & prod versions) - Required before CI deployment
update-runtime-be:
	@echo "🔨 Building and pushing backend runtime images to Docker Hub..."
	docker buildx build --platform linux/amd64 $(DOCKER_BUILD_FLAGS) \
		-f Backend/build/Dockerfile.runtime \
		-t $(DOCKERHUB_BACKEND_RUNTIME) \
		-t $(DOCKERHUB_BACKEND_RUNTIME)-dev \
		-t $(DOCKERHUB_BACKEND_RUNTIME)-prod \
		--push \
		Backend/
	@echo "✅ Backend runtime updated and pushed (dev & prod versions)!"

## update-runtime-fe: Build and push frontend runtime image to Docker Hub (dev & prod versions) - Required before CI deployment
update-runtime-fe:
	@echo "🔨 Building and pushing frontend runtime images to Docker Hub..."
	docker buildx build --platform linux/amd64 $(DOCKER_BUILD_FLAGS) \
		-f Frontend/Dockerfile.runtime \
		-t $(DOCKERHUB_FRONTEND_RUNTIME) \
		-t $(DOCKERHUB_FRONTEND_RUNTIME)-dev \
		-t $(DOCKERHUB_FRONTEND_RUNTIME)-prod \
		--push \
		Frontend/
	@echo "✅ Frontend runtime updated and pushed (dev & prod versions)!"

## env-check: Verify .env file exists
env-check:
	@if [ -f .env ]; then \
		echo "✅ .env file found"; \
		echo "Environment variables loaded from .env"; \
	else \
		echo "⚠️  .env file not found!"; \
		echo "Please create .env file with required variables:"; \
		echo "  REDIS_PASSWORD=<password>"; \
		echo "  DEBUG=false"; \
		exit 1; \
	fi

## up: Start all services with docker-compose
up: env-check
	@echo "🚀 Starting all services..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo ""
	@echo "Backend:  http://localhost/be"
	@echo "Frontend: http://localhost:3030"
	@echo "Nginx:    http://localhost"
	@echo "Redis:    localhost:6379"

## down: Stop all services
down:
	@echo "🛑 Stopping all services..."
	docker-compose down
	@echo "✅ Services stopped"

## restart: Restart all services (down and up)
restart: down up
	@echo "✅ Services restarted"

## rebuild: Stop services, rebuild app images, and restart services
rebuild: down build up
	@echo "✅ Services rebuilt and restarted"

## logs: View logs from all services
logs:
	@echo "📋 Streaming logs (press Ctrl+C to exit)..."
	docker-compose logs -f

## ps: Show running containers
ps:
	@echo "🐳 Running containers:"
	docker-compose ps
