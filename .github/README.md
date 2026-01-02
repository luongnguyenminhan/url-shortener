# GitHub Actions Deployment Setup

This repository uses GitHub Actions with **self-hosted runners** for automated deployment of the URL Shortener application. The workflow uses repository secrets directly (no environment-specific configuration required).

## Workflow Overview

The deployment pipeline handles two environments:

### Development (main branch)
- **Trigger**: Push to `main` branch
- **Process**: Build and push Docker images with `-dev` suffix to Docker Hub
- **Images**:
  - `luongnguyenminhan/url-shortener:backend-runtime-dev`
  - `luongnguyenminhan/url-shortener:backend-dev`
  - `luongnguyenminhan/url-shortener:frontend-runtime-dev`
  - `luongnguyenminhan/url-shortener:frontend-dev`

### Production (version tags)
- **Trigger**: Push version tags (e.g., `1.0.0`, `2.1.3`)
- **Process**: Build and push Docker images with `-prod` suffix, then deploy to production server
- **Images**:
  - `luongnguyenminhan/url-shortener:backend-runtime-prod`
  - `luongnguyenminhan/url-shortener:backend-prod`
  - `luongnguyenminhan/url-shortener:frontend-runtime-prod`
  - `luongnguyenminhan/url-shortener:frontend-prod`

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### Docker Hub Credentials
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token (not password)

### Production Server Access (for production deployments)
- `PRODUCTION_HOST`: Production server IP or hostname
- `PRODUCTION_USER`: SSH username for the server
- `PRODUCTION_SSH_KEY`: Private SSH key for server access
- `PRODUCTION_PORT`: SSH port (optional, defaults to 22)
- `REDIS_PASSWORD`: Redis password for the application

## Repository Secrets (No Environments Required)

The workflow uses repository secrets directly instead of environment-specific secrets:

## Self-Hosted Runner Requirements

Since this workflow uses `runs-on: self-hosted`, you need to set up GitHub Actions runners on your own infrastructure:

### Runner Setup
1. **Install GitHub Actions Runner** on your server(s)
2. **Register the runner** with your repository or organization
3. **Ensure Docker** is installed and accessible to the runner user
4. **Runner labels**: Make sure your runners can be targeted (default is fine)

### Runner Server Requirements
- **Docker and Docker Compose** installed
- **Git** installed
- **Network access** to Docker Hub and GitHub
- **Sufficient disk space** for Docker images and build cache
- **Permissions** to run Docker commands

## Production Server Setup Requirements

The production server must have:

1. **Docker and Docker Compose** installed
2. **SSH access** configured for the deployment user
3. **Application directory** at `/opt/url-shortener`
4. **Docker Hub access** (if using private images)

### Server Directory Structure
```
/opt/url-shortener/
├── docker-compose.yml
├── makefile
├── .env (will be created automatically)
└── nginx/
    └── nginx.conf
```

## Usage

### Development Deployment
```bash
# Push to main branch triggers automatic deployment
git push origin main
```

### Production Deployment
```bash
# Create and push a version tag
git tag 1.0.0
git push origin 1.0.0
```

## Manual Deployment

You can also trigger the workflow manually using the "workflow_dispatch" event:

1. Go to Actions tab in GitHub
2. Select "Deploy Application" workflow
3. Click "Run workflow"
4. Choose the branch or tag to deploy

## Troubleshooting

### Common Issues

1. **No self-hosted runners available**
   - Ensure GitHub Actions runners are installed and running on your infrastructure
   - Check that runners are registered with the correct repository/organization
   - Verify runners are online and not paused

2. **Docker Hub Authentication Failed**
   - Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are correct
   - Ensure the token has write permissions

2. **SSH Connection Failed**
   - Check `PRODUCTION_HOST`, `PRODUCTION_USER`, and `PRODUCTION_SSH_KEY`
   - Verify SSH key format (should be private key, not public)
   - Ensure the server allows SSH connections

3. **Deployment Directory Not Found**
   - Create `/opt/url-shortener` directory on the server
   - Copy `docker-compose.yml`, `makefile`, and `nginx/` directory

4. **Environment Variables Missing**
   - Check that `REDIS_PASSWORD` secret is set
   - The `.env` file will be created automatically on first deployment

### Logs and Monitoring

- Check GitHub Actions logs for build/deployment status
- Use `docker-compose logs` on the server to view application logs
- Use `docker-compose ps` to check service status