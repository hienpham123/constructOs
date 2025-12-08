#!/bin/bash

# ConstructOS Deployment Script
# This script helps deploy the application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ConstructOS Deployment Script${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  File .env not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your production values before continuing!${NC}"
    echo "Press Enter to continue after editing .env, or Ctrl+C to cancel..."
    read
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

# Function to check if services are running
check_services() {
    echo -e "${GREEN}📊 Checking services status...${NC}"
    docker-compose ps
}

# Function to view logs
view_logs() {
    echo -e "${GREEN}📋 Viewing logs...${NC}"
    docker-compose logs -f --tail=100
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Services stopped${NC}"
}

# Function to start services
start_services() {
    echo -e "${GREEN}▶️  Starting services...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Services started${NC}"
    echo ""
    echo -e "${GREEN}Waiting for services to be healthy...${NC}"
    sleep 10
    check_services
}

# Function to rebuild and start
rebuild_services() {
    echo -e "${GREEN}🔨 Rebuilding and starting services...${NC}"
    docker-compose up -d --build
    echo -e "${GREEN}✅ Services rebuilt and started${NC}"
    echo ""
    echo -e "${GREEN}Waiting for services to be healthy...${NC}"
    sleep 10
    check_services
}

# Function to backup database
backup_database() {
    echo -e "${GREEN}💾 Backing up database...${NC}"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    source .env
    docker-compose exec -T mysql mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > ${BACKUP_FILE}
    echo -e "${GREEN}✅ Database backed up to ${BACKUP_FILE}${NC}"
}

# Function to show menu
show_menu() {
    echo ""
    echo -e "${GREEN}Select an option:${NC}"
    echo "1) Start services"
    echo "2) Stop services"
    echo "3) Rebuild and start services"
    echo "4) View logs"
    echo "5) Check services status"
    echo "6) Backup database"
    echo "7) View deployment guide"
    echo "8) Exit"
    echo ""
    read -p "Enter option [1-8]: " option
}

# Main loop
while true; do
    show_menu
    case $option in
        1)
            start_services
            ;;
        2)
            stop_services
            ;;
        3)
            rebuild_services
            ;;
        4)
            view_logs
            ;;
        5)
            check_services
            ;;
        6)
            backup_database
            ;;
        7)
            if [ -f DEPLOYMENT.md ]; then
                cat DEPLOYMENT.md | less
            else
                echo -e "${RED}❌ DEPLOYMENT.md not found!${NC}"
            fi
            ;;
        8)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option!${NC}"
            ;;
    esac
done

