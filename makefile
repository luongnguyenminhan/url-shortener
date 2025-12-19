.PHONY: help build build-backend-runtime build-backend-app build-frontend-runtime build-frontend-app build-all clean push push-all docker-login up down logs restart ps down-clean env-check

# Variables
REGISTRY :=
DOCKERHUB_REGISTRY := luongnguyenminhan
IMAGE_NAME := urls
DOCKER_BUILD_FLAGS := --progress=plain

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
	@echo "  make build              - Build all images"
	@echo "  make build-backend      - Build backend runtime and app images"
	@echo "  make build-frontend     - Build frontend runtime and app images"
	@echo "  make push-all           - Build and push all images to Docker Hub"
	@echo "  make docker-login       - Login to Docker Hub"
	@echo "  make up                 - Start all services (docker-compose)"
	@echo "  make down               - Stop all services"
	@echo "  make down-clean         - Stop and remove all containers, volumes"
	@echo "  make logs               - View logs from all services"
	@echo "  make restart            - Restart all services"
	@echo "  make ps                 - Show running containers"
	@echo "  make env-check          - Verify .env file exists"
	@echo "  make clean              - Remove all local images"

## build: Build all images (backend & frontend)
build: build-backend build-frontend
	@echo "✅ All images built successfully!"
	@echo ""
	@echo "Backend Runtime:  $(BACKEND_RUNTIME_IMAGE)"
	@echo "Backend App:      $(BACKEND_APP_IMAGE)"
	@echo "Frontend Runtime: $(FRONTEND_RUNTIME_IMAGE)"
	@echo "Frontend App:     $(FRONTEND_APP_IMAGE)"

## build-backend: Build backend runtime and app images
build-backend: build-backend-runtime build-backend-app
	@echo "✅ Backend images built successfully!"

## build-backend-runtime: Build backend runtime image
build-backend-runtime:
	@echo "🔨 Building backend runtime image: $(BACKEND_RUNTIME_IMAGE)"
	docker build $(DOCKER_BUILD_FLAGS) \
		-f Backend/build/Dockerfile.runtime \
		-t $(BACKEND_RUNTIME_IMAGE) \
		Backend/
	@echo "✅ Backend runtime image built: $(BACKEND_RUNTIME_IMAGE)"

## build-backend-app: Build backend app image (depends on runtime)
build-backend-app: build-backend-runtime
	@echo "🔨 Building backend app image: $(BACKEND_APP_IMAGE)"
	docker build $(DOCKER_BUILD_FLAGS) \
		-f Backend/build/Dockerfile.app \
		--build-arg RUNTIME_IMAGE=$(BACKEND_RUNTIME_IMAGE) \
		-t $(BACKEND_APP_IMAGE) \
		Backend/
	@echo "✅ Backend app image built: $(BACKEND_APP_IMAGE)"

## build-frontend: Build frontend runtime and app images
build-frontend: build-frontend-runtime build-frontend-app
	@echo "✅ Frontend images built successfully!"

## build-frontend-runtime: Build frontend runtime image
build-frontend-runtime:
	@echo "🔨 Building frontend runtime image: $(FRONTEND_RUNTIME_IMAGE)"
	docker build $(DOCKER_BUILD_FLAGS) \
		-f Frontend/Dockerfile.runtime \
		-t $(FRONTEND_RUNTIME_IMAGE) \
		Frontend/
	@echo "✅ Frontend runtime image built: $(FRONTEND_RUNTIME_IMAGE)"

## build-frontend-app: Build frontend app image (depends on runtime)
build-frontend-app: build-frontend-runtime
	@echo "🔨 Building frontend app image: $(FRONTEND_APP_IMAGE)"
	docker build $(DOCKER_BUILD_FLAGS) \
		-f Frontend/Dockerfile.app \
		--build-arg RUNTIME_IMAGE=$(FRONTEND_RUNTIME_IMAGE) \
		-t $(FRONTEND_APP_IMAGE) \
		Frontend/
	@echo "✅ Frontend app image built: $(FRONTEND_APP_IMAGE)"

## clean: Remove all built images
clean:
	@echo "🗑️  Cleaning up Docker images..."
	-docker rmi $(BACKEND_RUNTIME_IMAGE) 2>/dev/null || true
	-docker rmi $(BACKEND_APP_IMAGE) 2>/dev/null || true
	-docker rmi $(FRONTEND_RUNTIME_IMAGE) 2>/dev/null || true
	-docker rmi $(FRONTEND_APP_IMAGE) 2>/dev/null || true
	@echo "✅ Cleanup complete"

## list: List all local urls images
list:
	@echo "Local urls images:"
	docker images | grep -E "$(REGISTRY)/$(IMAGE_NAME)" || echo "No images found"

## inspect-backend-runtime: Inspect backend runtime image details
inspect-backend-runtime:
	docker inspect $(BACKEND_RUNTIME_IMAGE)

## inspect-backend-app: Inspect backend app image details
inspect-backend-app:
	docker inspect $(BACKEND_APP_IMAGE)

## inspect-frontend-runtime: Inspect frontend runtime image details
inspect-frontend-runtime:
	docker inspect $(FRONTEND_RUNTIME_IMAGE)

## inspect-frontend-app: Inspect frontend app image details
inspect-frontend-app:
	docker inspect $(FRONTEND_APP_IMAGE)

## docker-login: Login to Docker Hub
docker-login:
	@echo "🔐 Logging in to Docker Hub as $(DOCKERHUB_REGISTRY)..."
	docker login -u $(DOCKERHUB_REGISTRY)
	@echo "✅ Successfully logged in to Docker Hub"

## push-all: Build and push all images to Docker Hub
push-all: build
	@echo "📤 Pushing all images to Docker Hub..."
	docker tag $(BACKEND_RUNTIME_IMAGE) $(DOCKERHUB_BACKEND_RUNTIME) && docker push $(DOCKERHUB_BACKEND_RUNTIME)
	docker tag $(BACKEND_APP_IMAGE) $(DOCKERHUB_BACKEND_APP) && docker push $(DOCKERHUB_BACKEND_APP)
	docker tag $(FRONTEND_RUNTIME_IMAGE) $(DOCKERHUB_FRONTEND_RUNTIME) && docker push $(DOCKERHUB_FRONTEND_RUNTIME)
	docker tag $(FRONTEND_APP_IMAGE) $(DOCKERHUB_FRONTEND_APP) && docker push $(DOCKERHUB_FRONTEND_APP)
	@echo "✅ All images pushed to Docker Hub successfully!"
	@echo ""
	@echo "Backend Runtime:  $(DOCKERHUB_BACKEND_RUNTIME)"
	@echo "Backend App:      $(DOCKERHUB_BACKEND_APP)"
	@echo "Frontend Runtime: $(DOCKERHUB_FRONTEND_RUNTIME)"
	@echo "Frontend App:     $(DOCKERHUB_FRONTEND_APP)"

## push: Push all tagged images to Docker Hub
push: push-backend-runtime push-backend-app push-frontend-runtime push-frontend-app
	@echo "✅ All images pushed successfully!"

## push-backend-runtime: Push backend runtime to Docker Hub
push-backend-runtime:
	@echo "📤 Pushing $(DOCKERHUB_BACKEND_RUNTIME) to Docker Hub..."
	docker tag $(BACKEND_RUNTIME_IMAGE) $(DOCKERHUB_BACKEND_RUNTIME) && docker push $(DOCKERHUB_BACKEND_RUNTIME)
	@echo "✅ Backend runtime pushed"

## push-backend-app: Push backend app to Docker Hub
push-backend-app:
	@echo "📤 Pushing $(DOCKERHUB_BACKEND_APP) to Docker Hub..."
	docker tag $(BACKEND_APP_IMAGE) $(DOCKERHUB_BACKEND_APP) && docker push $(DOCKERHUB_BACKEND_APP)
	@echo "✅ Backend app pushed"

## push-frontend-runtime: Push frontend runtime to Docker Hub
push-frontend-runtime:
	@echo "📤 Pushing $(DOCKERHUB_FRONTEND_RUNTIME) to Docker Hub..."
	docker tag $(FRONTEND_RUNTIME_IMAGE) $(DOCKERHUB_FRONTEND_RUNTIME) && docker push $(DOCKERHUB_FRONTEND_RUNTIME)
	@echo "✅ Frontend runtime pushed"

## push-frontend-app: Push frontend app to Docker Hub
push-frontend-app:
	@echo "📤 Pushing $(DOCKERHUB_FRONTEND_APP) to Docker Hub..."
	docker tag $(FRONTEND_APP_IMAGE) $(DOCKERHUB_FRONTEND_APP) && docker push $(DOCKERHUB_FRONTEND_APP)
	@echo "✅ Frontend app pushed"

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
up: env-check build
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

## down-clean: Stop services and remove volumes
down-clean:
	@echo "🗑️  Stopping and cleaning up all services and volumes..."
	docker-compose down -v
	@echo "✅ Cleanup complete - all containers and volumes removed"

## restart: Restart all services
restart: down up
	@echo "✅ Services restarted"

## logs: View logs from all services
logs:
	@echo "📋 Streaming logs (press Ctrl+C to exit)..."
	docker-compose logs -f

## logs-backend: View backend service logs
logs-backend:
	docker-compose logs -f backend

## logs-frontend: View frontend service logs
logs-frontend:
	docker-compose logs -f frontend

## logs-redis: View redis service logs
logs-redis:
	docker-compose logs -f redis

## logs-nginx: View nginx service logs
logs-nginx:
	docker-compose logs -f nginx

## ps: Show running containers
ps:
	@echo "🐳 Running containers:"
	docker-compose ps

## exec-backend: Execute command in backend container
exec-backend:
	@read -p "Enter command to execute in backend: " cmd; \
	docker-compose exec backend $$cmd

## exec-frontend: Execute command in frontend container
exec-frontend:
	@read -p "Enter command to execute in frontend: " cmd; \
	docker-compose exec frontend $$cmd

## shell-backend: Open bash shell in backend container
shell-backend:
	docker-compose exec backend /bin/bash

## shell-frontend: Open bash shell in frontend container
shell-frontend:
	docker-compose exec frontend /bin/sh

## shell-redis: Open redis-cli in redis container
shell-redis:
	docker-compose exec redis redis-cli -a $${REDIS_PASSWORD:-urls123}
