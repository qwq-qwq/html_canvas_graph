import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: { 
      globals: {
        ...globals.browser,
        // Add custom globals used in your project
        canvas: true,
        ctx: true,
        particleArray: true,
        hue: true,
        mouse: true,
        drawMode: true,
        spiral: true,
        flowField: true,
        ripple: true,
        terrain: true,
        waveParticles: true,
        paletteWidth: true,
        paletteLength: true,
        paletteRotation: true,
        paletteOpacity: true,
        lastPaletteX: true,
        lastPaletteY: true,
        autoPaletteX: true,
        autoPaletteY: true,
        paletteShape: true,
        autoPathType: true,
        colorMode: true,
        baseHue: true,
        particleSize: true,
        connectionDistance: true,
        particlesPerClick: true,
        particlesPerMove: true,
        fillMode: true,
        fadeAmount: true,
        gradientMode: true,
        gradientColors: true,
        autoPathSpeed: true,
        autoRotateSpeed: true,
        autoPathTypes: true,
        Particle: true,
        drawPalette: true,
        updateAutoCenter: true,
        handleParticles: true,
        getParticleColor: true,
        displayInfo: true,
        initAutoMode: true,
        initTerrain: true,
        updateSpiralPath: true,
        updateFlowFieldPath: true,
        updateRippleEffect: true,
        updateTerrainPath: true,
        drawWaveParticles: true,
        addWaveParticlesKeyHandler: true,
        toggleWaveParticlesMode: true,
        drawSinglePaletteStroke: true,
        initWaveParticles: true
      },
      ecmaVersion: 2022,
      sourceType: 'script'
    },
    files: ["js/**/*.js"],
    rules: {
      // Disable problematic rules for this project
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-redeclare": "off",
      "no-case-declarations": "off",
      
      // Code style - keep these for better formatting
      "semi": ["warn", "never"],
      "quotes": ["warn", "single", { "avoidEscape": true }],
      "indent": ["warn", 2],
      
      // Relaxed rules
      "eqeqeq": ["warn", "smart"],
      "no-var": "off",
      "prefer-const": "off",
      "no-console": ["warn", { allow: ["error", "warn", "info"] }],
      
      // Canvas-specific relaxations
      "no-magic-numbers": "off",
      "max-params": "off",
      "no-loop-func": "off",
      "no-unused-expressions": "off"
    }
  },
  // Override the recommended config to disable problematic rules
  {
    ...pluginJs.configs.recommended,
    rules: {
      ...pluginJs.configs.recommended.rules,
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-redeclare": "off",
      "no-case-declarations": "off"
    }
  }
];