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