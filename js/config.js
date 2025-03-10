// Глобальные переменные и настройки
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')
ctx.canvas.width = window.innerWidth
ctx.canvas.height = window.innerHeight

// Массив для хранения частиц
const particleArray = []

// Основные настройки
let hue = 0
let particleSize = 15 // Максимальный размер частиц
let connectionDistance = 100 // Расстояние для соединения частиц
let particlesPerClick = 10
let particlesPerMove = 5
let colorMode = 'rainbow' // rainbow, monochrome, pastel
let baseHue = 180 // Базовый оттенок для режима monochrome
let fillMode = 'fill' // fill, fade, clear - режимы очистки экрана
let fadeAmount = 0.02 // Значение для частичного затемнения в режиме fade

// Параметры шпателя
let drawMode = 'particles' // 'particles', 'palette' или 'auto'
let paletteWidth = 50
let paletteLength = 150
let paletteRotation = 0 // Вращение шпателя в градусах
let paletteOpacity = 0.7
let lastPaletteX = null
let lastPaletteY = null
let gradientMode = 'hue' // hue, rainbow, custom
let gradientColors = [
    {pos: 0, color: 'red'},
    {pos: 0.5, color: 'yellow'},
    {pos: 1, color: 'blue'}
]

// Параметры автоматического режима
// Режимы автоматического рисования: 'spiralWave', 'flowField', 'ripple', 'terrain'
let autoPathType = 'spiralWave'
let autoPathSpeed = 2
let autoPaletteX = null
let autoPaletteY = null
let autoRotateSpeed = 1 // Скорость вращения шпателя в авторежиме

// Параметры для режима спирали
let spiral = {
    centerX: 0,
    centerY: 0,
    radius: 100,
    angle: 0,
    radiusGrowth: 1,
    rotationSpeed: 0.002,
    autoChangeTime: 0,
    autoChangeDelay: 1000 // Время в миллисекундах до смены направления
}

// Параметры для режима потокового поля
let flowField = {
    time: 0,
    timeSpeed: 0.01,        // Скорость анимации
    noiseScale: 0.005,      // Масштаб шума для вариаций
    amplitude: 100,
    baseRotation: 0,         // Базовый угол вращения шпателя (0-360)
    maxRotationDeviation: 45, // Максимальное отклонение от базового угла в градусах
    bounceElasticity: 0.95,   // Эластичность при отскоке
    directionInfluence: 0.8, // Влияние направления движения на вращение шпателя (0-1)
    alignRotationOnBounce: true, // Выравнивать ли шпатель вдоль поверхности при отскоке
    limitRotation: true,     // Ограничивать ли поворот в пределах maxRotationDeviation от baseRotation
    velocities: null,        // Массив для хранения векторов скорости
    
    // Параметры для движения по эллипсу
    ellipseMode: true,       // Включить режим движения по эллипсу
    ellipseAngle: 45,        // Угол наклона эллипса в градусах
    ellipseCenterX: null,    // Центр эллипса X (null = центр холста)
    ellipseCenterY: null,    // Центр эллипса Y (null = центр холста)
    ellipseMajorAxis: null,  // Большая полуось эллипса (null = 40% ширины холста)
    ellipseMinorAxis: null,  // Малая полуось эллипса (null = 30% высоты холста)
    ellipseSpeed: 0.005,     // Скорость движения по эллипсу
    ellipseDirection: 1,     // Направление движения (1 = по часовой, -1 = против часовой)
    ellipseChangeTime: 0,    // Время последнего изменения параметров эллипса
    ellipseChangeDelay: 10000, // Задержка между изменениями параметров эллипса (мс)
    ellipsePhase: 0,         // Текущая фаза движения по эллипсу
    ellipseVariation: 0.2,    // Вариация размера и положения эллипса (0-1)
    wallRepulsionForce: 1.2, // Сила отталкивания от стен
    centerAttractionForce: 0.8, // Сила притяжения к центру
    attractionPointX: null,  // X-координата текущей точки притяжения (null = центр холста)
    attractionPointY: null,  // Y-координата текущей точки притяжения (null = центр холста)
    lastAttractionChange: 0, // Время последнего изменения точки притяжения
    attractionChangeDelay: 5000, // Минимальная задержка между изменениями точки притяжения (мс)
    rightWallAvoidanceZone: 100 // Зона избегания правой стенки (пикселей)
}

// Параметры для режима волн
let ripple = {
    centerX: 0,
    centerY: 0,
    frequency: 0.1,
    waves: [],
    maxWaves: 5,
    waveInterval: 500,
    lastWaveTime: 0,
    minOpacity: 0.2,  // Минимальная прозрачность для волн
    baseOpacity: 0.8  // Базовая прозрачность для волн
}

// Позиция мыши
const mouse = {
    x: 100,
    y: 100
}

let waveParticles = {
    enabled: false, // Флаг активации режима
    lineCount: 50,  // Количество линий
    pointsPerLine: 1002, // Точек на каждую линию
    amplitude: 50,  // Амплитуда волны
    frequency: 0.01, // Частота
    speed: 0.005,   // Скорость анимации
    lineWidth: 0.5, // Толщина линии
    baseHue: 0,     // Базовый оттенок
    hueRange: 60,   // Диапазон изменения оттенка
    resolution: 5,  // Шаг между точками (для производительности)
    opacity: 0.5,   // Прозрачность линий
    time: 0,        // Время для анимации
    maxPoints: 5000, // Максимальное количество точек для производительности
    mode: 'wave',   // Режим: 'wave', 'spiral', 'grid'
    linesOnly: true, // Только линии (true) или с частицами (false)
    
    // Параметры для вариаций градиентов
    colorMode: 'hue',  // Режим цвета: 'hue', 'rainbow', 'custom', 'monochrome'
    saturation: 100,   // Насыщенность цвета (%)
    lightness: 50,     // Яркость цвета (%)
    customGradient: [  // Пользовательский градиент (используется в режиме 'custom')
        {pos: 0, color: 'red'},
        {pos: 0.5, color: 'yellow'},
        {pos: 1, color: 'blue'}
    ],
    gradientSpeed: 0.5, // Скорость изменения градиента
    colorCycleSpeed: 0.2, // Скорость цикла изменения цвета
    rainbowFrequency: 0.01, // Частота изменения цвета в режиме 'rainbow'
    monochromeColor: 180,  // Базовый цвет для режима 'monochrome'
    monochromeRange: 30    // Диапазон изменения в режиме 'monochrome'
}


const terrain = {
    // Базовые параметры
    noiseScale: 0.005,        // Масштаб шума для генерации высот
    timeSpeed: 0.0005,        // Скорость изменения ландшафта со временем
    time: 0,                  // Текущее время для анимации

    // Параметры сетки
    gridSize: 40,             // Размер сетки (количество точек по одной стороне)
    pointSpacing: 30,         // Расстояние между точками

    // Параметры высот
    minHeight: 0,             // Минимальная высота
    maxHeight: 200,           // Максимальная высота
    heightMultiplier: 5,    // Множитель высоты для усиления эффекта

    // Параметры изолиний
    contourLevels: 10,        // Количество уровней изолиний
    contourThickness: 0.5,    // Толщина линий изолиний

    // Параметры отображения
    showPoints: true,         // Показывать точки
    showContours: false,       // Показывать изолинии
    showSurface: false,        // Показывать поверхность (заливка между изолиниями)

    // Цветовые параметры
    colorMode: 'terrain',      // Режим цвета: 'height', 'gradient', 'terrain'
    baseHue: 180,             // Базовый оттенок (для режима 'height')
    hueRange: 240,            // Диапазон оттенков (для режима 'height')

    // Градиент для режима 'terrain' (имитация природных цветов)
    terrainColors: [
        { height: 0, color: '#0077be' },    // Глубокая вода
        { height: 0.1, color: '#00a9e6' },  // Мелкая вода
        { height: 0.2, color: '#cfc35b' },  // Песок/пляж
        { height: 0.3, color: '#7ec850' },  // Низкая растительность
        { height: 0.5, color: '#3d8c40' },  // Леса
        { height: 0.7, color: '#a98c78' },  // Горы
        { height: 0.8, color: '#91786a' },  // Высокие горы
        { height: 0.9, color: '#ffffff' }   // Снег
    ],

    // Параметры соединения точек
    connectionThreshold: 0.1, // Порог разницы высот для соединения точек
    maxConnections: 5,        // Максимальное количество соединений для одной точки

    // Параметры динамики
    waveSpeed: 0.001,         // Скорость волн на поверхности
    waveAmplitude: 0.2,       // Амплитуда волн

    // Массив для хранения точек сетки
    points: [],
    viewMode: 'perspective',  // 'top', 'isometric', 'perspective'
    viewAngle: 30,          // Угол обзора в градусах (для изометрии ~30 градусов)
    viewElevation: 10,      // Угол возвышения в градусах
    depthFactor: 0.5,       // Фактор глубины для 3D эффекта
    showGrid: false,         // Показывать сетку
    gridOpacity: 0.3,       // Прозрачность сетки
    heightScale: 120,       // Масштаб высоты для более выраженного 3D эффекта
    rotationAngle: 45,      // Угол поворота сцены вокруг вертикальной оси
    cameraDistance: 500,    // Расстояние до камеры
    zOffset: 200,           // Смещение по Z (глубина)
    useShading: true,       // Использовать затенение по высоте
    shadingIntensity: 0.4  // Интенсивность затенения
};


// Режимы автоматического рисования
const autoPathTypes = ['spiralWave', 'flowField', 'ripple', 'terrain']

