// Режим имитации топографической поверхности с изменяющимися высотами

// Функция для инициализации режима топографической поверхности
function initTerrain() {
  // Создаем сетку точек
  terrain.points = []
    
  // Вычисляем количество точек, которые поместятся на экране
  const gridWidth = Math.ceil(canvas.width / terrain.pointSpacing)
  const gridHeight = Math.ceil(canvas.height / terrain.pointSpacing)
    
  // Создаем точки с начальными координатами
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      terrain.points.push({
        x: x * terrain.pointSpacing,
        y: y * terrain.pointSpacing,
        baseX: x * terrain.pointSpacing,
        baseY: y * terrain.pointSpacing,
        height: 0,
        connections: []
      })
    }
  }
    
  // Сбрасываем время
  terrain.time = 0
}

// Функция для обновления высот точек
function updateTerrainHeights() {
  // Увеличиваем время для анимации
  terrain.time += terrain.timeSpeed
    
  // Обновляем высоту каждой точки на основе шума Перлина
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]
        
    // Используем шум Перлина для генерации высоты
    // Добавляем временную составляющую для анимации
    const noiseX = point.baseX * terrain.noiseScale
    const noiseY = point.baseY * terrain.noiseScale
    const noiseT = terrain.time
        
    // Основная высота из шума Перлина
    let height = noise(noiseX, noiseY, noiseT)
        
    // Добавляем волны для более динамичного эффекта
    const wave1 = Math.sin(noiseX * 10 + noiseT * 2) * terrain.waveAmplitude * 0.5
    const wave2 = Math.cos(noiseY * 10 + noiseT * 3) * terrain.waveAmplitude * 0.3
        
    // Комбинируем основную высоту с волнами
    height = height + wave1 + wave2
        
    // Нормализуем высоту в диапазоне от 0 до 1
    height = (height + 1) * 0.5
        
    // Применяем множитель высоты
    height = height * terrain.heightMultiplier
        
    // Ограничиваем высоту в пределах от 0 до 1
    height = Math.max(0, Math.min(1, height))
        
    // Сохраняем высоту точки
    point.height = height
  }
}

// Функция для определения соединений между точками
function updateTerrainConnections() {
  // Очищаем предыдущие соединения
  for (let i = 0; i < terrain.points.length; i++) {
    terrain.points[i].connections = []
  }
    
  // Для каждой точки ищем соседей для соединения
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]
        
    // Ищем ближайшие точки
    for (let j = 0; j < terrain.points.length; j++) {
      if (i === j) continue // Пропускаем саму точку
            
      const neighbor = terrain.points[j]
            
      // Вычисляем расстояние между точками
      const dx = point.x - neighbor.x
      const dy = point.y - neighbor.y
      const distance = Math.sqrt(dx * dx + dy * dy)
            
      // Соединяем только с ближайшими соседями
      if (distance <= terrain.pointSpacing * 1.5) {
        // Вычисляем разницу высот
        const heightDiff = Math.abs(point.height - neighbor.height)
                
        // Соединяем точки, если разница высот меньше порога
        // или если они находятся на одном уровне изолинии
        const pointLevel = Math.floor(point.height * terrain.contourLevels) / terrain.contourLevels
        const neighborLevel = Math.floor(neighbor.height * terrain.contourLevels) / terrain.contourLevels
                
        if (heightDiff <= terrain.connectionThreshold || pointLevel === neighborLevel) {
          // Добавляем соединение, если не превышен лимит
          if (point.connections.length < terrain.maxConnections) {
            point.connections.push(j)
          }
        }
      }
    }
  }
}

// Функция для получения цвета в зависимости от высоты
function getTerrainColor(height) {
  switch (terrain.colorMode) {
  case 'height':
    // Цвет на основе высоты (от базового оттенка до базовый+диапазон)
    const hue = terrain.baseHue + height * terrain.hueRange
    // Насыщенность и яркость зависят от высоты
    const saturation = 70 + height * 30
    const lightness = 20 + height * 60
    return `hsl(${hue % 360}, ${saturation}%, ${lightness}%)`
            
  case 'gradient':
    // Градиент от синего (низины) к красному (вершины)
    const r = Math.floor(height * 255)
    const g = Math.floor((1 - Math.abs(height - 0.5) * 2) * 255)
    const b = Math.floor((1 - height) * 255)
    return `rgb(${r}, ${g}, ${b})`
            
  case 'terrain':
    // Реалистичные цвета ландшафта
    const colors = terrain.terrainColors
            
    // Находим два ближайших цвета в градиенте
    let color1 = colors[0].color
    let color2 = colors[colors.length - 1].color
            
    for (let i = 0; i < colors.length - 1; i++) {
      if (height >= colors[i].height && height <= colors[i + 1].height) {
        color1 = colors[i].color
        color2 = colors[i + 1].color
                    
        // Вычисляем позицию между двумя цветами
        const t = (height - colors[i].height) / (colors[i + 1].height - colors[i].height)
                    
        // Интерполируем между цветами
        return interpolateColor(color1, color2, t)
      }
    }
            
    return color2 // Возвращаем последний цвет, если высота больше максимальной
            
  default:
    return `hsl(${terrain.baseHue}, 70%, 50%)`
  }
}

// Функция для интерполяции между двумя цветами
function interpolateColor(color1, color2, factor) {
  // Преобразуем цвета в RGB
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
    
  // Интерполируем между RGB значениями
  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r))
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g))
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b))
    
  return `rgb(${r}, ${g}, ${b})`
}

// Функция для преобразования HEX в RGB
function hexToRgb(hex) {
  // Удаляем # если есть
  hex = hex.replace('#', '')
    
  // Преобразуем короткий формат (#RGB) в полный (#RRGGBB)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
    
  // Преобразуем в RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
    
  return { r, g, b }
}

// Функция для отрисовки топографической поверхности
function drawTerrain() {
  // Обновляем высоты точек
  updateTerrainHeights()
    
  // Обновляем соединения между точками
  updateTerrainConnections()
    
  // Отрисовываем поверхность (если включено)
  if (terrain.showSurface) {
    drawTerrainSurface()
  }
    
  // Отрисовываем изолинии (если включено)
  if (terrain.showContours) {
    drawTerrainContours()
  }
    
  // Отрисовываем точки (если включено)
  if (terrain.showPoints) {
    drawTerrainPoints()
  }
}

// Функция для отрисовки точек
function drawTerrainPoints() {
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]

    // Получаем цвет точки в зависимости от высоты
    const color = getTerrainColor(point.height)

    // Размер точки зависит от высоты
    const size = 1 + point.height * 3

    // Отрисовываем точку
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Функция для отрисовки изолиний
function drawTerrainContours() {
  // Устанавливаем стиль линий
  ctx.lineWidth = terrain.contourThickness

  // Для каждого уровня изолиний
  for (let level = 0; level <= terrain.contourLevels; level++) {
    const normalizedLevel = level / terrain.contourLevels

    // Цвет изолинии зависит от высоты
    ctx.strokeStyle = getTerrainColor(normalizedLevel)

    // Начинаем новый путь
    ctx.beginPath()

    // Проходим по всем точкам
    for (let i = 0; i < terrain.points.length; i++) {
      const point = terrain.points[i]

      // Определяем, находится ли точка на текущем уровне изолинии
      const pointLevel = Math.floor(point.height * terrain.contourLevels) / terrain.contourLevels

      if (Math.abs(pointLevel - normalizedLevel) < 0.001) {
        // Соединяем с другими точками на том же уровне
        for (let j = 0; j < point.connections.length; j++) {
          const neighborIndex = point.connections[j]
          const neighbor = terrain.points[neighborIndex]

          const neighborLevel = Math.floor(neighbor.height * terrain.contourLevels) / terrain.contourLevels

          if (Math.abs(neighborLevel - normalizedLevel) < 0.001) {
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(neighbor.x, neighbor.y)
          }
        }
      }
    }

    // Отрисовываем линии
    ctx.stroke()
  }
}

// Функция для отрисовки поверхности (заливка между изолиниями)
function drawTerrainSurface() {
  // Создаем временный канвас для отрисовки поверхности
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
    
  // Очищаем временный канвас
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
    
  // Для каждой точки создаем градиентную заливку
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]
        
    // Создаем радиальный градиент от точки
    const gradient = tempCtx.createRadialGradient(
      point.x, point.y, 0,
      point.x, point.y, terrain.pointSpacing * 1.2
    )
        
    // Цвет градиента зависит от высоты
    const color = getTerrainColor(point.height)
        
    // Добавляем цветовые остановки
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
        
    // Отрисовываем градиент
    tempCtx.fillStyle = gradient
    tempCtx.beginPath()
    tempCtx.arc(point.x, point.y, terrain.pointSpacing * 1.2, 0, Math.PI * 2)
    tempCtx.fill()
  }
    
  // Копируем результат на основной канвас с прозрачностью
  ctx.globalAlpha = 0.7
  ctx.drawImage(tempCanvas, 0, 0)
  ctx.globalAlpha = 1.0
}

// Функция для обновления режима топографической поверхности
function updateTerrainPath() {
  // Очищаем экран с небольшим затуханием
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
    
  // Отрисовываем топографическую поверхность
  drawTerrain()
}

// Функция шума Перлина (упрощенная версия)
function noise(x, y, z) {
  // Простая реализация шума на основе синусов
  // В реальном проекте лучше использовать полноценную библиотеку шума Перлина
  const nx = Math.sin(x)
  const ny = Math.sin(y)
  const nz = Math.sin(z)
    
  // Комбинируем синусы для получения псевдослучайного значения
  return Math.sin(nx * 10 + ny * 5 + nz * 2) * 0.5 +
           Math.sin(nx * 5 + ny * 15 + nz * 3) * 0.3 +
           Math.sin(nx * 7 + ny * 3 + nz * 5) * 0.2
} 

// Функция для преобразования 3D координат в 2D для изометрического вида
function iso3DTo2D(x, y, z) {
  // Преобразуем углы в радианы
  const viewAngleRad = terrain.viewAngle * Math.PI / 180
  const viewElevationRad = terrain.viewElevation * Math.PI / 180
  const rotationRad = terrain.rotationAngle * Math.PI / 180

  // Поворачиваем точку вокруг вертикальной оси (Y)
  const rotatedX = x * Math.cos(rotationRad) - z * Math.sin(rotationRad)
  const rotatedZ = x * Math.sin(rotationRad) + z * Math.cos(rotationRad)

  // Применяем изометрическую проекцию
  const projectedX = canvas.width / 2 + rotatedX * Math.cos(viewAngleRad) -
        rotatedZ * Math.cos(viewElevationRad) * Math.sin(viewAngleRad)
  const projectedY = canvas.height / 2 + rotatedX * Math.sin(viewAngleRad) +
        rotatedZ * Math.cos(viewElevationRad) * Math.cos(viewAngleRad) -
        y * Math.sin(viewElevationRad)

  return {
    x: projectedX,
    y: projectedY,
    z: rotatedZ // Сохраняем Z для определения порядка отрисовки
  }
}

// Функция для вычисления освещенности в зависимости от высоты и наклона
function calculateLighting(height, x, y, neighbors) {
  if (!terrain.useShading) return 1.0

  // Базовое освещение от высоты (более высокие участки светлее)
  let lighting = 0.5 + height * 0.5

  // Если есть соседи, вычисляем нормаль поверхности для более реалистичного освещения
  if (neighbors && neighbors.length >= 3) {
    // Вычисляем векторы для плоскости
    const v1 = {
      x: neighbors[1].x - neighbors[0].x,
      y: neighbors[1].y - neighbors[0].y,
      z: (neighbors[1].height - neighbors[0].height) * terrain.heightScale
    }

    const v2 = {
      x: neighbors[2].x - neighbors[0].x,
      y: neighbors[2].y - neighbors[0].y,
      z: (neighbors[2].height - neighbors[0].height) * terrain.heightScale
    }

    // Вычисляем нормаль через векторное произведение
    const normal = {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x
    }

    // Нормализуем вектор
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
    normal.x /= length
    normal.y /= length
    normal.z /= length

    // Направление света (сверху-сбоку)
    const lightDir = { x: 0.5, y: 0.5, z: 1.0 }
    const lightLength = Math.sqrt(lightDir.x * lightDir.x + lightDir.y * lightDir.y + lightDir.z * lightDir.z)
    lightDir.x /= lightLength
    lightDir.y /= lightLength
    lightDir.z /= lightLength

    // Вычисляем освещенность как скалярное произведение
    const dot = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z
    lighting = 0.3 + Math.max(0, dot) * 0.7 // 30% ambient + 70% directional
  }

  // Применяем интенсивность затенения
  return 1.0 - terrain.shadingIntensity * (1.0 - lighting)
}

// Обновленная функция инициализации с 3D координатами
function initTerrain() {
  // Создаем сетку точек
  terrain.points = []

  // Настраиваем размеры сетки в зависимости от размера экрана
  const ratio = canvas.width / canvas.height
  const gridWidth = Math.ceil(terrain.gridSize * ratio)
  const gridHeight = terrain.gridSize

  // Размер ячейки сетки
  const cellWidth = canvas.width / (gridWidth - 1)
  const cellHeight = canvas.height / (gridHeight - 1)

  // Смещение сетки для центрирования
  const offsetX = -canvas.width / 2
  const offsetY = -canvas.height / 2

  // Создаем точки с 3D координатами
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      // Вычисляем координаты в 3D пространстве
      const worldX = offsetX + x * cellWidth
      const worldY = 0 // Начальная высота
      const worldZ = offsetY + y * cellHeight

      terrain.points.push({
        worldX: worldX,
        worldY: worldY,
        worldZ: worldZ,
        gridX: x,
        gridY: y,
        x: 0, // Будет вычислено при проекции
        y: 0, // Будет вычислено при проекции
        height: 0,
        projected: false,
        connections: [],
        neighbors: []
      })
    }
  }

  // Находим соседей для каждой точки (для расчета освещения)
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]
    const neighbors = []

    for (let j = 0; j < terrain.points.length; j++) {
      if (i === j) continue

      const neighbor = terrain.points[j]

      // Соседи - это точки, смежные по сетке
      if (Math.abs(point.gridX - neighbor.gridX) <= 1 &&
                Math.abs(point.gridY - neighbor.gridY) <= 1) {
        neighbors.push(j)
      }
    }

    point.neighbors = neighbors
  }

  // Сбрасываем время
  terrain.time = 0
}

// Обновленная функция обновления высот с поддержкой 3D
function updateTerrainHeights() {
  // Увеличиваем время для анимации
  terrain.time += terrain.timeSpeed

  // Обновляем высоту каждой точки на основе шума Перлина
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]

    // Получаем координаты в пространстве шума
    const noiseX = point.gridX * terrain.noiseScale
    const noiseY = point.gridY * terrain.noiseScale
    const noiseT = terrain.time

    // Основная высота из шума Перлина
    let height = noise(noiseX, noiseY, noiseT)

    // Добавляем волны для более динамичного эффекта
    const wave1 = Math.sin(noiseX * 10 + noiseT * 2) * terrain.waveAmplitude * 0.5
    const wave2 = Math.cos(noiseY * 10 + noiseT * 3) * terrain.waveAmplitude * 0.3

    // Комбинируем основную высоту с волнами
    height = height + wave1 + wave2

    // Нормализуем высоту в диапазоне от 0 до 1
    height = (height + 1) * 0.5

    // Применяем множитель высоты
    height = height * terrain.heightMultiplier

    // Ограничиваем высоту в пределах от 0 до 1
    height = Math.max(0, Math.min(1, height))

    // Сохраняем высоту точки
    point.height = height

    // Устанавливаем реальную высоту в 3D пространстве
    point.worldY = -height * terrain.heightScale
  }

  // Проецируем 3D координаты на 2D экран
  projectPointsTo2D()

  // Сортируем точки по глубине для корректной отрисовки
  terrain.points.sort((a, b) => b.depth - a.depth)
}

// Функция для проецирования точек из 3D в 2D
function projectPointsTo2D() {
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]

    // Проецируем 3D координаты на 2D экран
    const projected = iso3DTo2D(point.worldX, point.worldY, point.worldZ)

    // Сохраняем спроецированные координаты
    point.x = projected.x
    point.y = projected.y
    point.depth = projected.z
    point.projected = true
  }
}

// Обновленная функция определения соединений между точками
function updateTerrainConnections() {
  // Очищаем предыдущие соединения
  for (let i = 0; i < terrain.points.length; i++) {
    terrain.points[i].connections = []
  }

  // Находим координаты X и Y для каждой клетки сетки
  const gridWidth = Math.ceil(Math.sqrt(terrain.points.length))

  // Соединяем точки в сетке
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]
    const x = point.gridX
    const y = point.gridY

    // Получаем индексы соседних точек в сетке
    const right = i + 1
    const bottom = i + gridWidth
    const bottomRight = bottom + 1

    // Проверяем, что правая точка находится в той же строке
    if (right < terrain.points.length && terrain.points[right].gridY === y) {
      point.connections.push(right)
    }

    // Проверяем, что нижняя точка существует
    if (bottom < terrain.points.length) {
      point.connections.push(bottom)
    }

    // Проверяем, что нижняя правая точка существует и правая точка в той же строке
    if (bottomRight < terrain.points.length && terrain.points[right].gridY === y) {
      point.connections.push(bottomRight)
    }
  }
}

// Обновленная функция для отрисовки точек с учетом глубины
function drawTerrainPoints() {
  for (let i = 0; i < terrain.points.length; i++) {
    const point = terrain.points[i]

    // Пропускаем точки, которые не были спроецированы
    if (!point.projected) continue

    // Получаем цвет точки с учетом освещения
    const baseColor = getTerrainColor(point.height)
    // Получаем соседей для расчета освещения
    const neighbors = point.neighbors.map(idx => terrain.points[idx])
    const lighting = calculateLighting(point.height, point.x, point.y, neighbors)
    const color = adjustColorByLighting(baseColor, lighting)

    // Размер точки зависит от высоты и глубины
    const baseSize = point.height
    const size = baseSize * (1 - point.depth / (terrain.cameraDistance * 2))

    // Отрисовываем точку
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(point.x, point.y, Math.max(0.5, size), 0, Math.PI * 2)
    ctx.fill()
  }
}

// Функция для изменения цвета с учетом освещения
function adjustColorByLighting(color, lighting) {
  // Для HSL
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (match) {
      const h = match[1]
      const s = match[2]
      const l = Math.min(100, Math.max(0, parseInt(match[3]) * lighting))
      return `hsl(${h}, ${s}%, ${l}%)`
    }
  }

  // Для RGB
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const r = Math.min(255, Math.max(0, parseInt(match[1]) * lighting))
      const g = Math.min(255, Math.max(0, parseInt(match[2]) * lighting))
      const b = Math.min(255, Math.max(0, parseInt(match[3]) * lighting))
      return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
    }
  }

  // Для HEX: сначала конвертируем в RGB
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    const adjustedR = Math.min(255, Math.max(0, r * lighting))
    const adjustedG = Math.min(255, Math.max(0, g * lighting))
    const adjustedB = Math.min(255, Math.max(0, b * lighting))

    return `rgb(${Math.floor(adjustedR)}, ${Math.floor(adjustedG)}, ${Math.floor(adjustedB)})`
  }

  return color
}

// Обновленная функция отрисовки изолиний
function drawTerrainContours() {
  // Устанавливаем стиль линий
  ctx.lineWidth = terrain.contourThickness

  // Для каждого уровня изолиний
  for (let level = 0; level <= terrain.contourLevels; level++) {
    const normalizedLevel = level / terrain.contourLevels

    // Цвет изолинии зависит от высоты
    ctx.strokeStyle = getTerrainColor(normalizedLevel)

    // Начинаем новый путь
    ctx.beginPath()

    // Проходим по всем точкам
    for (let i = 0; i < terrain.points.length; i++) {
      const point = terrain.points[i]

      // Пропускаем точки, которые не были спроецированы
      if (!point.projected) continue

      // Определяем, находится ли точка на текущем уровне изолинии
      const pointLevel = Math.floor(point.height * terrain.contourLevels) / terrain.contourLevels

      if (Math.abs(pointLevel - normalizedLevel) < 0.001) {
        // Соединяем с другими точками на том же уровне
        for (let j = 0; j < point.connections.length; j++) {
          const neighborIndex = point.connections[j]
          const neighbor = terrain.points[neighborIndex]

          // Пропускаем соседей, которые не были спроецированы
          if (!neighbor.projected) continue

          const neighborLevel = Math.floor(neighbor.height * terrain.contourLevels) / terrain.contourLevels

          if (Math.abs(neighborLevel - normalizedLevel) < 0.001) {
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(neighbor.x, neighbor.y)
          }
        }
      }
    }

    // Отрисовываем линии
    ctx.stroke()
  }
}

// Обновленная функция для отрисовки поверхности с учетом 3D
function drawTerrainSurface() {
  // Для отрисовки поверхности используем треугольники
  // Находим координаты X и Y для каждой клетки сетки
  const gridWidth = Math.ceil(Math.sqrt(terrain.points.length))

  // Для каждой клетки сетки
  for (let y = 0; y < gridWidth - 1; y++) {
    for (let x = 0; x < gridWidth - 1; x++) {
      const idx = y * gridWidth + x

      // Получаем четыре угла текущей клетки
      const topLeft = terrain.points[idx]
      const topRight = terrain.points[idx + 1]
      const bottomLeft = terrain.points[idx + gridWidth]
      const bottomRight = terrain.points[idx + gridWidth + 1]

      // Пропускаем, если какая-то из точек не существует
      if (!topLeft || !topRight || !bottomLeft || !bottomRight ||
                !topLeft.projected || !topRight.projected ||
                !bottomLeft.projected || !bottomRight.projected) {
        continue
      }

      // Рисуем два треугольника, образующих четырехугольник
      drawTerrainTriangle(topLeft, topRight, bottomLeft)
      drawTerrainTriangle(bottomLeft, topRight, bottomRight)
    }
  }
}

// Функция для отрисовки треугольника с заливкой
function drawTerrainTriangle(p1, p2, p3) {
  // Вычисляем среднюю высоту для треугольника
  const avgHeight = (p1.height + p2.height + p3.height) / 3

  // Базовый цвет зависит от средней высоты
  const baseColor = getTerrainColor(avgHeight)

  // Получаем освещение для треугольника
  const neighbors = [p1, p2, p3]
  const lighting = calculateLighting(avgHeight, 0, 0, neighbors)
  const color = adjustColorByLighting(baseColor, lighting)

  // Отрисовываем треугольник
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.closePath()
  ctx.fill()

  // Отрисовываем контур треугольника
  if (terrain.showGrid) {
    ctx.strokeStyle = `rgba(0,0,0,${terrain.gridOpacity})`
    ctx.lineWidth = 0.5
    ctx.stroke()
  }
}

// Обновленная функция для отрисовки топографической поверхности
function drawTerrain() {
  // Обновляем высоты точек и проецируем их
  updateTerrainHeights()

  // Обновляем соединения между точками
  updateTerrainConnections()

  // Отрисовываем поверхность (если включено)
  if (terrain.showSurface) {
    drawTerrainSurface()
  }

  // Отрисовываем изолинии (если включено)
  if (terrain.showContours) {
    drawTerrainContours()
  }

  // Отрисовываем точки (если включено)
  if (terrain.showPoints) {
    drawTerrainPoints()
  }
}

// Обновляем обработчики клавиатуры для управления изометрическим видом
function addIsometricTerrainControls() {
  window.addEventListener('keydown', function(event) {
    if (drawMode !== 'auto' || autoPathType !== 'terrain') return

    // Изменение угла обзора
    if (event.key === 'ArrowUp') {
      terrain.viewElevation = Math.min(80, terrain.viewElevation + 5)
    }
    if (event.key === 'ArrowDown') {
      terrain.viewElevation = Math.max(10, terrain.viewElevation - 5)
    }

    // Изменение угла поворота
    if (event.key === 'ArrowLeft') {
      terrain.rotationAngle = (terrain.rotationAngle - 5) % 360
    }
    if (event.key === 'ArrowRight') {
      terrain.rotationAngle = (terrain.rotationAngle + 5) % 360
    }

    // Изменение масштаба высоты
    if (event.key === 'a') {
      terrain.heightScale = Math.min(300, terrain.heightScale + 10)
    }
    if (event.key === 'z') {
      terrain.heightScale = Math.max(10, terrain.heightScale - 10)
    }

    // Включение/выключение сетки
    if (event.key === 'g') {
      terrain.showGrid = !terrain.showGrid
    }

    // Включение/выключение затенения
    if (event.key === 's') {
      terrain.useShading = !terrain.useShading
    }

    // Изменение интенсивности затенения
    if (event.key === 'd') {
      terrain.shadingIntensity = Math.min(1, terrain.shadingIntensity + 0.1)
    }
    if (event.key === 'f') {
      terrain.shadingIntensity = Math.max(0, terrain.shadingIntensity - 0.1)
    }

    // Сброс к изометрическому виду
    if (event.key === 'r') {
      terrain.viewAngle = 30
      terrain.viewElevation = 45
      terrain.rotationAngle = 45
      terrain.heightScale = 120
    }
  })
}


addIsometricTerrainControls()