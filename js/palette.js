// Function to create palette gradient
function createPaletteGradient(x, y, angle) {
    // Calculate start and end points of gradient along palette length
    const radians = (angle || 0) * Math.PI / 180

    // Make sure x and y are valid numbers
    x = isNaN(x) ? canvas.width / 2 : x
    y = isNaN(y) ? canvas.height / 2 : y

    const startX = x - (paletteLength / 2) * Math.cos(radians)
    const startY = y - (paletteLength / 2) * Math.sin(radians)
    const endX = x + (paletteLength / 2) * Math.cos(radians)
    const endY = y + (paletteLength / 2) * Math.sin(radians)

    // Make sure all coordinates are valid
    if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
        console.error("Invalid gradient coordinates:", { startX, startY, endX, endY })
        // Use default values if calculation failed
        return ctx.createLinearGradient(x - 10, y - 10, x + 10, y + 10)
    }

    // Create the gradient
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY)

    // Make sure hue is a valid number
    const currentHue = isNaN(hue) ? 0 : hue

    // Set opacity to valid value
    const opacity = isNaN(paletteOpacity) ? 0.7 :
                    paletteOpacity < 0 ? 0 :
                    paletteOpacity > 1 ? 1 : paletteOpacity

    switch(gradientMode) {
        case 'hue':
            // Gradient of one hue from light to dark
            gradient.addColorStop(0, `hsla(${currentHue}, 100%, 80%, ${opacity})`)
            gradient.addColorStop(0.5, `hsla(${currentHue}, 100%, 50%, ${opacity})`)
            gradient.addColorStop(1, `hsla(${currentHue}, 100%, 20%, ${opacity})`)
            break
        case 'rainbow':
            // Rainbow gradient
            gradient.addColorStop(0, `hsla(${currentHue}, 100%, 50%, ${opacity})`)
            gradient.addColorStop(0.2, `hsla(${(currentHue + 72) % 360}, 100%, 50%, ${opacity})`)
            gradient.addColorStop(0.4, `hsla(${(currentHue + 144) % 360}, 100%, 50%, ${opacity})`)
            gradient.addColorStop(0.6, `hsla(${(currentHue + 216) % 360}, 100%, 50%, ${opacity})`)
            gradient.addColorStop(0.8, `hsla(${(currentHue + 288) % 360}, 100%, 50%, ${opacity})`)
            gradient.addColorStop(1, `hsla(${currentHue}, 100%, 50%, ${opacity})`)
            break
        case 'custom':
            // Custom gradient
            if (Array.isArray(gradientColors) && gradientColors.length > 0) {
            gradientColors.forEach(color => {
                    if (color && typeof color.pos === 'number' && typeof color.color === 'string') {
                gradient.addColorStop(color.pos, color.color)
                    }
            })
            } else {
                // Fallback if gradientColors is invalid
                gradient.addColorStop(0, `hsla(${currentHue}, 100%, 70%, ${opacity})`)
                gradient.addColorStop(1, `hsla(${currentHue}, 100%, 30%, ${opacity})`)
            }
            break
        default:
            // Default to hue gradient
            gradient.addColorStop(0, `hsla(${currentHue}, 100%, 80%, ${opacity})`)
            gradient.addColorStop(0.5, `hsla(${currentHue}, 100%, 50%, ${opacity})`)
            gradient.addColorStop(1, `hsla(${currentHue}, 100%, 20%, ${opacity})`)
    }

    return gradient
}

// Function to draw with palette
function drawPalette(x, y) {
    // Make sure x and y are valid numbers
    x = isNaN(x) ? canvas.width / 2 : x
    y = isNaN(y) ? canvas.height / 2 : y

    // If this is not the first stroke, create a smooth line
    if (lastPaletteX !== null && lastPaletteY !== null &&
        !isNaN(lastPaletteX) && !isNaN(lastPaletteY)) {

        // Calculate number of intermediate strokes based on distance
        const dx = x - lastPaletteX
        const dy = y - lastPaletteY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Limit steps to prevent too many calculations for large distances
        const steps = Math.min(20, Math.max(1, Math.floor(distance / 10)))

        // Draw intermediate strokes for smoothness
        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps
            const interpX = lastPaletteX + dx * ratio
            const interpY = lastPaletteY + dy * ratio
            drawSinglePaletteStroke(interpX, interpY)
        }
    } else {
        // First stroke
        drawSinglePaletteStroke(x, y)
    }

    // Save current position for next stroke
    lastPaletteX = x
    lastPaletteY = y
            }

// Drawing a single stroke with the palette
function drawSinglePaletteStroke(x, y) {
    // Make sure x and y are valid numbers
    x = isNaN(x) ? canvas.width / 2 : x
    y = isNaN(y) ? canvas.height / 2 : y

    // Make sure palette dimensions are valid
    const width = isNaN(paletteWidth) || paletteWidth <= 0 ? 50 : paletteWidth
    const length = isNaN(paletteLength) || paletteLength <= 0 ? 150 : paletteLength
    const rotation = isNaN(paletteRotation) ? 0 : paletteRotation

    // Apply gradient
    const gradient = createPaletteGradient(x, y, rotation)
    ctx.fillStyle = gradient

    // Save current context state
    ctx.save()

    // Move origin to drawing point
    ctx.translate(x, y)

    // Rotate context
    ctx.rotate(rotation * Math.PI / 180)

    // Draw rounded rectangle (palette)
    const halfWidth = width / 2
    const halfLength = length / 2

    // Make sure the radius of corner arcs isn't too large
    const cornerRadius = Math.min(halfWidth, width / 2)

    // Create the path for rounded rectangle
    ctx.beginPath()

    try {
        // Top left arc
        ctx.arc(-halfLength + cornerRadius, -halfWidth + cornerRadius, cornerRadius, Math.PI, Math.PI * 1.5)
        // Top line
        ctx.lineTo(halfLength - cornerRadius, -halfWidth)
        // Top right arc
        ctx.arc(halfLength - cornerRadius, -halfWidth + cornerRadius, cornerRadius, Math.PI * 1.5, 0)
        // Right line
        ctx.lineTo(halfLength, halfWidth - cornerRadius)
        // Bottom right arc
        ctx.arc(halfLength - cornerRadius, halfWidth - cornerRadius, cornerRadius, 0, Math.PI * 0.5)
        // Bottom line
        ctx.lineTo(-halfLength + cornerRadius, halfWidth)
        // Bottom left arc
        ctx.arc(-halfLength + cornerRadius, halfWidth - cornerRadius, cornerRadius, Math.PI * 0.5, Math.PI)
        // Left line
        ctx.lineTo(-halfLength, -halfWidth + cornerRadius)
    ctx.closePath()

    ctx.fill()
    } catch (error) {
        console.error("Error drawing palette stroke:", error)

        // Fallback to simpler rectangle if drawing failed
        ctx.fillRect(-halfLength, -halfWidth, length, width)
    }

    // Restore context state
    ctx.restore()
}