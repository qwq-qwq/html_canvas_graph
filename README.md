# HTML Canvas Graph

An interactive canvas-based application for creating visual effects and animations.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

## Development

Open `index.html` in your browser to run the application.

## Linting

This project uses ESLint to maintain code quality. The following npm scripts are available:

- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Automatically fix linting errors where possible
- `npm run lint:report` - Generate an HTML report of linting errors

### ESLint Configuration

The ESLint configuration is in `eslint.config.mjs`. It includes:

- Browser environment globals
- Custom globals for canvas variables
- Rules optimized for canvas-based JavaScript
- Code style preferences

### VS Code Integration

If you're using VS Code, the project includes settings for automatic linting and formatting on save. Make sure you have the ESLint extension installed.

## Code Structure

- `js/config.js` - Global variables and settings
- `js/main.js` - Main animation loop and initialization
- `js/particle.js` - Particle class and handling
- `js/palette.js` - Palette drawing functionality
- `js/utils.js` - Utility functions
- `js/event-handlers.js` - User interaction handlers
- `js/wave-particles.js` - Wave particle system
- `js/auto-modes/` - Different automatic drawing modes:
  - `spiral.js` - Spiral path generation
  - `flow-field.js` - Flow field simulation
  - `ripple.js` - Ripple effect
  - `terrain.js` - Terrain generation

## Key Features

- Multiple drawing modes: particles, palette, auto-drawing
- Various visual effects: spirals, flow fields, ripples, terrain
- Interactive controls for customizing visuals
- Wave particle system for creating complex patterns

## Deployment

This project includes comprehensive deployment scripts and configurations that allow you to easily set up a production environment with CI/CD, monitoring, and caching.

### Prerequisites

- A Linux server (tested on Ubuntu/Debian)
- Root access to the server
- Domain name (optional, but recommended for SSL)

### Deployment Scripts

The project includes several deployment scripts:

- `deploy-master.sh` - Main deployment script for setting up the initial infrastructure
- `deploy.sh` - Script for deploying updates to the application
- `setup-monitoring.sh` - Script for setting up monitoring and caching infrastructure

### Docker Deployment

The project is containerized using Docker for easier deployment and scaling:

1. Build the Docker image:
   ```
   docker build -t canvas-graph:latest .
   ```

2. Run the container:
   ```
   docker-compose up -d
   ```

The Docker configuration includes:
- Nginx for serving the application and routing
- Volume mounting for persisting data
- Network configuration for service communication

### CI/CD with Jenkins

A complete Jenkins pipeline is included for continuous integration and deployment:

1. Set up Jenkins using the instructions in `jenkins-setup.md`
2. Configure Jenkins to work in the `/jenkins` subdirectory using `jenkins-config.md`
3. Import the `Jenkinsfile` pipeline to automatically build and deploy the application

The Jenkins pipeline includes stages for:
- Checking out code
- Setting up the environment
- Linting the code
- Building the Docker image
- Deploying the application
- Verifying the deployment
- Cleaning up old artifacts

### Monitoring and Metrics

The application includes a complete monitoring stack:

- **Prometheus**: For collecting and storing metrics
- **Grafana**: For visualizing metrics data
- **Node Exporter**: For collecting server metrics

The monitoring system tracks:
- Application performance metrics
- HTTP request counts and durations
- Server resource utilization
- Custom application metrics

### Caching with Redis

Redis is configured for caching to improve application performance:

- Cache frequently accessed data
- Reduce database load
- Improve response times for repeated requests

### Access Points

After deployment, the following services will be available:

- **Application**: http://your_ip_address/
- **Jenkins**: http://your_ip_address/jenkins/
- **Prometheus**: http://your_ip_address/prometheus/
- **Grafana**: http://your_ip_address/grafana/
- **Node Metrics**: http://your_ip_address/node-metrics/

## Security

The deployment includes several security features:

- Basic authentication for monitoring endpoints
- Ability to enable HTTPS with SSL certificates
- Secure Redis configuration
- Container isolation
- Configuration for securing Jenkins

## Additional Documentation

Detailed documentation is available in the following files:

- `jenkins-setup.md` - Setting up Jenkins
- `jenkins-config.md` - Configuring Jenkins
- `monitoring-setup.md` - Detailed guide for monitoring and caching setup
- `Dockerfile` - Docker image configuration
- `nginx.conf` - Nginx configuration 