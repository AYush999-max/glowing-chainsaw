#!/bin/bash

# ===========================================
# Glowing Chainsaw - Multi-Tenant Platform
# Complete Docker Setup and Feature Demo
# ===========================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP $1]${NC} ${WHITE}$2${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Waiting for $service_name to be ready...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi

        echo -n "."
        sleep 2
        ((attempt++))
    done

    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to demonstrate API endpoints
test_api_endpoints() {
    print_step "API" "Testing API endpoints..."

    # Test health check
    if curl -s http://localhost:5000/api/ | grep -q "Welcome"; then
        print_success "API health check passed"
    else
        print_warning "API health check failed (expected if MongoDB not connected)"
    fi

    # Test API structure
    print_info "Available API endpoints:"
    echo "  • POST /api/auth/login - User authentication"
    echo "  • POST /api/auth/register - User registration (admin only)"
    echo "  • GET /api/users/:tenantId - List users by tenant"
    echo "  • POST /api/users - Create user"
    echo "  • GET /api/tenants - List all tenants (owner only)"
    echo "  • POST /api/tenants - Create tenant (owner only)"
    echo "  • POST /api/data - Submit data with images"
    echo "  • GET /api/data/:tenantId - Get tenant data"
    echo "  • PUT /api/data/:id/review - Review data (manager)"
    echo "  • PUT /api/data/:id/approve - Approve data (admin)"
    echo "  • GET /api/dashboard/stats - Dashboard statistics"
    echo "  • GET /api/audit - Audit logs"
}

# Function to demonstrate features
demonstrate_features() {
    print_step "FEATURES" "Demonstrating platform features..."

    echo -e "\n${PURPLE}🎯 CORE FEATURES:${NC}"
    echo "  • Multi-tenant architecture with data isolation"
    echo "  • Role-based access control (Owner/Admin/Manager/Engineer)"
    echo "  • JWT authentication with secure API endpoints"
    echo "  • Form validation and image upload capabilities"
    echo "  • Workflow management (Submit → Review → Approve)"
    echo "  • KYC and licensing verification system"
    echo "  • Complete audit logging system"
    echo "  • Real-time dashboard with analytics"

    echo -e "\n${PURPLE}📱 USER ROLES & PERMISSIONS:${NC}"
    echo "  • Owner: Full platform access, manages all tenants"
    echo "  • Admin: Manages users and data within their tenant"
    echo "  • Manager: Reviews and approves data submissions"
    echo "  • Engineer: Submits data and photos via mobile/web"

    echo -e "\n${PURPLE}🌐 WEB APPLICATION FEATURES:${NC}"
    echo "  • Responsive dashboard with real-time statistics"
    echo "  • User management interface with CRUD operations"
    echo "  • Data review system with approval workflow"
    echo "  • Tenant management for owners"
    echo "  • Audit log viewer with filtering"
    echo "  • Form validation and error handling"

    echo -e "\n${PURPLE}📱 PROGRESSIVE WEB APP (PWA):${NC}"
    echo "  • Installable on mobile devices"
    echo "  • Offline-first architecture with service worker"
    echo "  • Camera integration for photo capture"
    echo "  • Background sync for offline submissions"
    echo "  • Mobile-optimized responsive design"
    echo "  • App-like experience with manifest"

    echo -e "\n${PURPLE}🔒 SECURITY FEATURES:${NC}"
    echo "  • JWT token-based authentication"
    echo "  • Role-based API access control"
    echo "  • Input validation with Joi schemas"
    echo "  • Rate limiting and CORS protection"
    echo "  • Helmet security headers"
    echo "  • Secure file upload handling"
}

# Function to show access information
show_access_info() {
    print_step "ACCESS" "Platform access information"

    echo -e "\n${GREEN}🌐 WEB APPLICATION:${NC}"
    echo "  URL: http://localhost:3000"
    echo "  Features: Full web dashboard, admin interface"

    echo -e "\n${GREEN}🔧 API ENDPOINTS:${NC}"
    echo "  Base URL: http://localhost:5000/api"
    echo "  Documentation: RESTful API with JWT auth"

    echo -e "\n${GREEN}📱 MOBILE PWA:${NC}"
    echo "  URL: http://localhost:3000 (on mobile device)"
    echo "  Install: Tap 'Add to Home Screen'"
    echo "  Features: Camera, offline sync, mobile UI"

    echo -e "\n${GREEN}🐳 DOCKER SERVICES:${NC}"
    echo "  • glowing-chainsaw-frontend (port 3000)"
    echo "  • glowing-chainsaw-backend (port 5000)"
    echo "  • glowing-chainsaw-mongodb (port 27017)"

    echo -e "\n${YELLOW}📊 DEFAULT CREDENTIALS:${NC}"
    echo "  Create your first account through registration"
    echo "  Owner role required for initial tenant setup"
}

# Main execution
main() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              Glowing Chainsaw - Multi-Tenant Platform       ║"
    echo "║                     Docker Setup & Demo                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_step "1" "Building and starting all services with Docker Compose..."

    # Stop any existing containers
    print_info "Stopping existing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true

    # Build and start services
    print_info "Building Docker images..."
    docker-compose build --no-cache

    print_info "Starting all services..."
    docker-compose up -d

    # Wait for services to be ready
    print_step "2" "Waiting for services to initialize..."

    print_info "Waiting for MongoDB..."
    wait_for_service "MongoDB" "http://localhost:27017"

    print_info "Waiting for Backend API..."
    wait_for_service "Backend API" "http://localhost:5000/api/"

    print_info "Waiting for Frontend..."
    wait_for_service "Frontend" "http://localhost:3000"

    # Show service status
    print_step "3" "Checking service status..."
    echo ""
    docker-compose ps

    # Test API endpoints
    print_step "4" "Testing API functionality..."
    test_api_endpoints

    # Demonstrate features
    print_step "5" "Platform feature overview..."
    demonstrate_features

    # Show access information
    print_step "6" "Access information and next steps..."
    show_access_info

    echo -e "\n${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 SETUP COMPLETE!                       ║"
    echo "║                                                            ║"
    echo "║  Open http://localhost:3000 in your browser to start       ║"
    echo "║  using the multi-tenant platform!                          ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    echo -e "\n${YELLOW}Useful Docker commands:${NC}"
    echo "  • View logs: docker-compose logs -f [service-name]"
    echo "  • Stop all: docker-compose down"
    echo "  • Restart: docker-compose restart"
    echo "  • Clean up: docker-compose down --volumes --remove-orphans"

    echo -e "\n${CYAN}To test the platform:${NC}"
    echo "  1. Visit http://localhost:3000"
    echo "  2. Register as an Owner to create tenants"
    echo "  3. Create users with different roles"
    echo "  4. Test data submission and approval workflow"
    echo "  5. Try the mobile PWA on a phone/tablet"
}

# Handle script arguments
case "${1:-}" in
    "stop")
        print_info "Stopping all services..."
        docker-compose down --remove-orphans
        print_success "All services stopped"
        ;;
    "restart")
        print_info "Restarting all services..."
        docker-compose restart
        print_success "Services restarted"
        ;;
    "logs")
        print_info "Showing service logs..."
        docker-compose logs -f
        ;;
    "status")
        print_info "Service status:"
        docker-compose ps
        ;;
    *)
        main
        ;;
esac