#!/bin/bash

# Configuration
SERVER_USER="root"  # Change this to your server username if not root
SERVER_IP="64.226.112.61"  # Enter your Digital Ocean server IP here
SSH_KEY_PATH=""  # Optional: path to your SSH key file (e.g., ~/.ssh/id_rsa)
APP_DIR="/opt/canvas-graph"  # Directory on the server where the app will be deployed

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display usage
show_usage() {
    echo "Usage: $0 -i SERVER_IP [-u SERVER_USER] [-k SSH_KEY_PATH]"
    echo "  -i SERVER_IP      IP address of your Digital Ocean server"
    echo "  -u SERVER_USER    Server username (default: root)"
    echo "  -k SSH_KEY_PATH   Path to SSH key file (optional)"
    exit 1
}

# Parse command line arguments
while getopts ":i:u:k:" opt; do
    case $opt in
        i) SERVER_IP="$OPTARG" ;;
        u) SERVER_USER="$OPTARG" ;;
        k) SSH_KEY_PATH="$OPTARG" ;;
        \?) echo "Invalid option: -$OPTARG" >&2; show_usage ;;
        :) echo "Option -$OPTARG requires an argument." >&2; show_usage ;;
    esac
done

# Check if server IP is provided
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}Error: Server IP is required.${NC}"
    show_usage
fi

# Set SSH command with or without key
SSH_CMD="ssh"
SCP_CMD="scp"
if [ -n "$SSH_KEY_PATH" ]; then
    SSH_CMD="ssh -i $SSH_KEY_PATH"
    SCP_CMD="scp -i $SSH_KEY_PATH"
fi

# Print setup information
echo -e "${YELLOW}Starting initial setup for Digital Ocean server...${NC}"
echo -e "${YELLOW}Server: ${SERVER_USER}@${SERVER_IP}${NC}"
echo -e "${YELLOW}App directory: ${APP_DIR}${NC}"
if [ -n "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}Using SSH key: ${SSH_KEY_PATH}${NC}"
fi

# Create a temporary directory for deployment files
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Created temporary directory: ${TEMP_DIR}${NC}"

# Copy necessary files to the temporary directory
echo -e "${YELLOW}Preparing deployment files...${NC}"
cp -r .eslintignore *.md nginx.conf Dockerfile docker-compose.yml Jenkinsfile deploy-master.sh setup-monitoring.sh "${TEMP_DIR}/"
# Include directories
cp -r js/ "${TEMP_DIR}/js/"
# Create directories that might not exist
mkdir -p "${TEMP_DIR}/nginx/conf.d"
cp -r nginx/conf.d/* "${TEMP_DIR}/nginx/conf.d/" 2>/dev/null || true

# Check if we can connect to the server
echo -e "${YELLOW}Testing SSH connection to server...${NC}"
if ! $SSH_CMD "${SERVER_USER}@${SERVER_IP}" "echo SSH connection successful"; then
    echo -e "${RED}Failed to connect to the server. Please check your SSH credentials and server status.${NC}"
    rm -rf "${TEMP_DIR}"
    exit 1
fi

# Install required packages on the server
echo -e "${YELLOW}Installing required packages on the server...${NC}"
$SSH_CMD "${SERVER_USER}@${SERVER_IP}" "apt-get update && apt-get install -y curl git"

# Create the app directory on the server
echo -e "${YELLOW}Creating app directory on the server...${NC}"
$SSH_CMD "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${APP_DIR}"

# Copy files to the server
echo -e "${YELLOW}Copying files to server...${NC}"
$SCP_CMD -r "${TEMP_DIR}"/* "${SERVER_USER}@${SERVER_IP}:${APP_DIR}/"

# Make scripts executable
echo -e "${YELLOW}Making scripts executable...${NC}"
$SSH_CMD "${SERVER_USER}@${SERVER_IP}" "chmod +x ${APP_DIR}/deploy-master.sh ${APP_DIR}/setup-monitoring.sh"

# Run the master deployment script
echo -e "${YELLOW}Running master deployment script on the server...${NC}"
echo -e "${YELLOW}This might take several minutes...${NC}"
$SSH_CMD "${SERVER_USER}@${SERVER_IP}" "cd ${APP_DIR} && ./deploy-master.sh"

# Check the deployment status
echo -e "${YELLOW}Checking deployment status...${NC}"
if $SSH_CMD "${SERVER_USER}@${SERVER_IP}" "docker ps | grep jenkins"; then
    echo -e "${GREEN}Initial deployment successful!${NC}"
    echo -e "${GREEN}Jenkins should be accessible at: http://${SERVER_IP}/jenkins/${NC}"
    echo -e "${YELLOW}To set up monitoring and caching, run:${NC}"
    echo -e "${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'cd ${APP_DIR} && ./setup-monitoring.sh'${NC}"
else
    echo -e "${RED}Deployment may have failed. Please check the server logs.${NC}"
    echo -e "${YELLOW}You can check logs with: ssh ${SERVER_USER}@${SERVER_IP} 'docker logs jenkins'${NC}"
fi

# Clean up temporary directory
rm -rf "${TEMP_DIR}"
echo -e "${YELLOW}Cleaned up temporary directory${NC}"

echo -e "${GREEN}Initial setup process completed.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Complete the Jenkins setup at http://${SERVER_IP}/jenkins/"
echo -e "2. Run the monitoring setup script on the server"
echo -e "3. Configure your application CI/CD pipeline in Jenkins" 