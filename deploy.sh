#!/bin/bash

# Configuration
SERVER_USER="root"  # Change this to your server username if not root
SERVER_IP="165.227.175.7"  # Change this to your Digital Ocean server IP
APP_DIR="/opt/canvas-graph"  # Directory on the server where the app will be deployed

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment to Digital Ocean server...${NC}"

# Run ESLint and fix issues
echo -e "${YELLOW}Running ESLint to fix code issues...${NC}"
npm run lint:fix

# Build the project if needed (not required for this static site)
echo -e "${YELLOW}Preparing files for deployment...${NC}"

# Create a temporary directory for deployment files
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Created temporary directory: ${TEMP_DIR}${NC}"

# Copy necessary files to the temporary directory
cp -r index.html .vscode/ nginx.conf Dockerfile docker-compose.yml "${TEMP_DIR}/"
cp -r js/ "${TEMP_DIR}/js/"

# SSH into the server and prepare the deployment directory
echo -e "${YELLOW}Preparing server directory...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${APP_DIR}"

# Copy files to the server
echo -e "${YELLOW}Copying files to server...${NC}"
scp -r "${TEMP_DIR}"/* "${SERVER_USER}@${SERVER_IP}:${APP_DIR}/"

# Deploy using Docker Compose
echo -e "${YELLOW}Deploying with Docker Compose...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" "cd ${APP_DIR} && docker-compose down && docker-compose up -d --build"

# Clean up temporary directory
rm -rf "${TEMP_DIR}"
echo -e "${YELLOW}Cleaned up temporary directory${NC}"

# Check if deployment was successful
echo -e "${YELLOW}Checking deployment status...${NC}"
CONTAINER_STATUS=$(ssh "${SERVER_USER}@${SERVER_IP}" "docker ps | grep canvas-graph")

if [[ -n "$CONTAINER_STATUS" ]]; then
  echo -e "${GREEN}Deployment successful! Your application is now running at http://${SERVER_IP}${NC}"
else
  echo -e "${RED}Deployment may have failed. Please check the server logs.${NC}"
  echo -e "${YELLOW}You can check logs with: ssh ${SERVER_USER}@${SERVER_IP} 'docker logs canvas-graph'${NC}"
fi

echo -e "${YELLOW}Deployment process completed.${NC}" 