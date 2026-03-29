// Глобальные переменные и настройки
const canvas = document.getElementById('canvas')
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
const fillMode = 'fill' // fill, fade, clear - режимы очистки экрана
let fadeAmount = 0.02 // Значение для частичного затемнения в режиме fade

// Показ справки
let showHelp = false

// Позиция мыши
const mouse = {
  x: 100,
  y: 100
}