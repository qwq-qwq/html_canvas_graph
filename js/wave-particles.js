// Добавим функцию для переключения в режим волновых частиц
function toggleWaveParticlesMode() {
  // Если режим уже активен, деактивируем
  if (waveParticles.enabled) {
    waveParticles.enabled = false
    drawMode = 'particles' // Возвращаемся в обычный режим частиц
  } else {
    // Включаем режим волновых частиц
    waveParticles.enabled = true
    drawMode = 'waveParticles'

    // Очищаем массив обычных частиц
    particleArray.length = 0

    // Инициализируем режим волновых частиц
    initWaveParticles()
  }
}

// Функция инициализации волновых частиц
function initWaveParticles() {
  // Расчет максимального количества линий и точек
  const totalPoints = waveParticles.lineCount * waveParticles.pointsPerLine

  // Если превышаем лимит, корректируем
  if (totalPoints > waveParticles.maxPoints) {
    const factor = Math.sqrt(waveParticles.maxPoints / totalPoints)
    waveParticles.lineCount = Math.floor(waveParticles.lineCount * factor)
    waveParticles.pointsPerLine = Math.floor(waveParticles.pointsPerLine * factor)
  }

  // Сбрасываем время
  waveParticles.time = 0
}

// Функция для получения цвета в зависимости от режима градиента
function getWaveParticleColor(index, total, position = 0) {
  const { 
    colorMode, baseHue, hueRange, saturation, lightness, 
    customGradient, time, colorCycleSpeed, rainbowFrequency,
    monochromeColor, monochromeRange
  } = waveParticles
    
  // Нормализованная позиция элемента (0-1)
  const normalizedIndex = index / total
    
  // Базовый сдвиг цвета со временем
  const timeShift = time * colorCycleSpeed
    
  switch (colorMode) {
  case 'hue':
    // Плавное изменение оттенка вдоль линий
    const hue = (baseHue + normalizedIndex * hueRange + timeShift) % 360
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${waveParticles.opacity})`
            
  case 'rainbow':
    // Радужный эффект с волновым изменением
    const rainbowHue = (baseHue + (Math.sin(normalizedIndex * Math.PI * 2 * rainbowFrequency + timeShift) + 1) * 180) % 360
    return `hsla(${rainbowHue}, ${saturation}%, ${lightness}%, ${waveParticles.opacity})`
            
  case 'custom':
    // Пользовательский градиент
    // Вычисляем позицию в градиенте с учетом времени
    const gradientPos = (normalizedIndex + position + timeShift * waveParticles.gradientSpeed) % 1
            
    // Находим два ближайших цвета в градиенте
    let color1 = customGradient[0]
    let color2 = customGradient[customGradient.length - 1]
            
    for (let i = 0; i < customGradient.length - 1; i++) {
      if (gradientPos >= customGradient[i].pos && gradientPos <= customGradient[i + 1].pos) {
        color1 = customGradient[i]
        color2 = customGradient[i + 1]
        break
      }
    }
            
    // Интерполируем между цветами
    const colorPos = (gradientPos - color1.pos) / (color2.pos - color1.pos)
    return interpolateColors(color1.color, color2.color, colorPos, waveParticles.opacity)
            
  case 'monochrome':
    // Монохромный режим с небольшими вариациями
    const monoHue = (monochromeColor + (Math.sin(normalizedIndex * Math.PI * 2 + timeShift) + 1) * (monochromeRange / 2)) % 360
    const monoSat = Math.max(0, saturation - 30) // Уменьшаем насыщенность для монохромного режима
    return `hsla(${monoHue}, ${monoSat}%, ${lightness}%, ${waveParticles.opacity})`
            
  default:
    return `hsla(${baseHue}, ${saturation}%, ${lightness}%, ${waveParticles.opacity})`
  }
}

// Функция для интерполяции между двумя цветами
function interpolateColors(color1, color2, factor, opacity) {
  // Преобразуем цвета в RGB
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
    
  // Интерполируем между RGB значениями
  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r))
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g))
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b))
    
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Функция для преобразования цвета в RGB
function hexToRgb(color) {
  // Если цвет задан как имя (например, 'red')
  if (typeof color === 'string' && color.indexOf('#') !== 0) {
    const tempElement = document.createElement('div')
    tempElement.style.color = color
    document.body.appendChild(tempElement)
    const computedColor = getComputedStyle(tempElement).color
    document.body.removeChild(tempElement)
        
    // Парсим RGB из строки вида "rgb(255, 0, 0)"
    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      }
    }
        
    // Если не удалось распарсить, возвращаем черный цвет
    return { r: 0, g: 0, b: 0 }
  }
    
  // Если цвет задан как HEX
  let hex = color.replace('#', '')
    
  // Если короткий формат (#RGB), преобразуем в полный (#RRGGBB)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
    
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
    
  return { r, g, b }
}

// Функция для отрисовки волновых частиц
function drawWaveParticles() {
  // Увеличиваем время для анимации
  waveParticles.time += waveParticles.speed

  // Очищаем холст для этого режима с небольшим затемнением
  ctx.fillStyle = `rgba(0,0,0,${fadeAmount})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Выбираем функцию отрисовки в зависимости от режима
  switch(waveParticles.mode) {
  case 'wave':
    drawWaveLines()
    break
  case 'spiral':
    drawSpiralLines()
    break
  case 'grid':
    drawGridLines()
    break
  default:
    drawWaveLines()
  }
}

// Функция отрисовки волновых линий
function drawWaveLines() {
  const { lineCount, pointsPerLine, amplitude, frequency, time, resolution, lineWidth, linesOnly } = waveParticles

  // Расстояние между линиями
  const yStep = canvas.height / (lineCount + 1)

  // Отрисовка каждой линии
  for (let i = 0; i < lineCount; i++) {
    // Базовая позиция Y для линии
    const baseY = (i + 1) * yStep

    // Получаем цвет для линии
    const lineColor = getWaveParticleColor(i, lineCount)
        
    // Начинаем путь для линии
    ctx.beginPath()
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth

    // Расчет и отрисовка точек линии
    for (let j = 0; j < pointsPerLine; j += resolution) {
      // Вычисляем X позицию
      const x = (j / pointsPerLine) * canvas.width

      // Вычисляем Y с волновыми модуляциями
      const offset1 = Math.sin((x * frequency) + time) * amplitude
      const offset2 = Math.cos((x * frequency * 0.5) + time * 0.7) * (amplitude * 0.5)
      const y = baseY + offset1 + offset2

      // Рисуем путь
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Если нужно, рисуем также частицы
      if (!linesOnly && j % (resolution * 4) === 0) {
        // Получаем цвет для частицы с небольшой вариацией
        const particleColor = getWaveParticleColor(i, lineCount, j / pointsPerLine)
        const particleOpacity = waveParticles.opacity + 0.2
                
        // Заменяем opacity в цвете
        let adjustedColor = particleColor
        if (particleColor.startsWith('hsla')) {
          adjustedColor = particleColor.replace(/,\s*[\d.]+\)$/, `, ${particleOpacity})`)
        } else if (particleColor.startsWith('rgba')) {
          adjustedColor = particleColor.replace(/,\s*[\d.]+\)$/, `, ${particleOpacity})`)
        }
                
        ctx.fillStyle = adjustedColor
        ctx.beginPath()
        ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Отрисовываем линию
    ctx.stroke()
  }
}

// Функция отрисовки спиральных линий
function drawSpiralLines() {
  const { lineCount, pointsPerLine, amplitude, frequency, time, resolution, lineWidth, linesOnly } = waveParticles

  // Центр спирали
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  // Максимальный радиус спирали (меньшая сторона холста / 2)
  const maxRadius = Math.min(canvas.width, canvas.height) * 0.45

  // Отрисовка каждой спирали
  for (let i = 0; i < lineCount; i++) {
    // Получаем цвет для спирали
    const spiralColor = getWaveParticleColor(i, lineCount)
        
    // Начинаем путь для спирали
    ctx.beginPath()
    ctx.strokeStyle = spiralColor
    ctx.lineWidth = lineWidth

    // Угловое смещение для текущей спирали
    const angleOffset = (i / lineCount) * Math.PI * 2

    // Расчет и отрисовка точек спирали
    for (let j = 0; j < pointsPerLine; j += resolution) {
      // Нормализованная позиция (0-1)
      const t = j / pointsPerLine

      // Радиус увеличивается от центра к краям
      const radius = t * maxRadius

      // Угол поворота с модуляцией
      const angle = t * Math.PI * 10 + angleOffset + 
                        Math.sin(t * frequency * 10 + time) * amplitude * 0.01

      // Вычисляем координаты
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Рисуем путь
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Если нужно, рисуем также частицы
      if (!linesOnly && j % (resolution * 4) === 0) {
        // Получаем цвет для частицы с небольшой вариацией
        const particleColor = getWaveParticleColor(i, lineCount, j / pointsPerLine)
        const particleOpacity = waveParticles.opacity + 0.2
                
        // Заменяем opacity в цвете
        let adjustedColor = particleColor
        if (particleColor.startsWith('hsla')) {
          adjustedColor = particleColor.replace(/,\s*[\d.]+\)$/, `, ${particleOpacity})`)
        } else if (particleColor.startsWith('rgba')) {
          adjustedColor = particleColor.replace(/,\s*[\d.]+\)$/, `, ${particleOpacity})`)
        }
                
        ctx.fillStyle = adjustedColor
        ctx.beginPath()
        ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Отрисовываем спираль
    ctx.stroke()
  }
}

// Функция отрисовки сетки
function drawGridLines() {
  const { lineCount, pointsPerLine, amplitude, frequency, time, resolution, lineWidth, linesOnly } = waveParticles

  // Количество линий по X и Y
  const xLines = Math.ceil(Math.sqrt(lineCount))
  const yLines = Math.ceil(lineCount / xLines)

  // Расстояние между линиями
  const xStep = canvas.width / (xLines + 1)
  const yStep = canvas.height / (yLines + 1)

  // Отрисовка горизонтальных линий
  for (let i = 0; i < yLines; i++) {
    // Базовая позиция Y для линии
    const baseY = (i + 1) * yStep

    // Получаем цвет для линии
    const lineColor = getWaveParticleColor(i, yLines)
        
    // Начинаем путь для линии
    ctx.beginPath()
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth

    // Расчет и отрисовка точек линии
    for (let j = 0; j < pointsPerLine; j += resolution) {
      // Вычисляем X позицию
      const x = (j / pointsPerLine) * canvas.width

      // Вычисляем Y с волновыми модуляциями
      const offset = Math.sin((x * frequency) + time + i) * amplitude
      const y = baseY + offset

      // Рисуем путь
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Если нужно, рисуем также частицы
      if (!linesOnly && j % (resolution * 4) === 0) {
        // Получаем цвет для частицы с небольшой вариацией
        const particleColor = getWaveParticleColor(i, yLines, j / pointsPerLine)
        const particleOpacity = waveParticles.opacity + 0.2
                
        // Заменяем opacity в цвете
        let adjustedColor = particleColor
        if (particleColor.startsWith('hsla')) {
          adjustedColor = particleColor.replace(/,\s*[\d.]+\)$/, `, ${particleOpacity})`)
        } else if (particleColor.startsWith('rgba')) {
          adjustedColor = particleColor.replace(/,\s*[\d.]+\)$/, `, ${particleOpacity})`)
        }
                
        ctx.fillStyle = adjustedColor
        ctx.beginPath()
        ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Отрисовываем линию
    ctx.stroke()
  }

  // Отрисовка вертикальных линий
  for (let i = 0; i < xLines; i++) {
    // Базовая позиция X для линии
    const baseX = (i + 1) * xStep

    // Получаем цвет для линии
    const lineColor = getWaveParticleColor(i + yLines, xLines + yLines)
        
    // Начинаем путь для линии
    ctx.beginPath()
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth

    // Расчет и отрисовка точек линии
    for (let j = 0; j < pointsPerLine; j += resolution) {
      // Вычисляем Y позицию
      const y = (j / pointsPerLine) * canvas.height

      // Вычисляем X с волновыми модуляциями
      const offset = Math.sin((y * frequency) + time + i) * amplitude
      const x = baseX + offset

      // Рисуем путь
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Если нужно, рисуем также частицы
      if (!linesOnly && j % (resolution * 4) === 0) {
        // Получаем цвет для частицы с небольшой вариацией
        const particleColor = getWaveParticleColor(i + yLines, xLines + yLines, j / pointsPerLine)
        const particleOpacity = waveParticles.opacity + 0.2
                
        // Заменяем opacity в цвете
        let adjustedColor = particleColor
        if (particleColor.startsWith('hsla')) {
          adjustedColor = particleColor.replace(/,\s*[\d.]+\)$/, `, ${particleOpacity})`)
        } else if (particleColor.startsWith('rgba')) {
          adjustedColor = particleColor.replace(/,\s*[\d.]+\)$/, `, ${particleOpacity})`)
        }
                
        ctx.fillStyle = adjustedColor
        ctx.beginPath()
        ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Отрисовываем линию
    ctx.stroke()
  }
}