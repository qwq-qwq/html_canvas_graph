// Функция для получения цвета частиц в зависимости от выбранного режима
function getParticleColor() {
  switch(colorMode) {
  case 'rainbow':
    return 'hsl(' + hue + ', 100%, 50%)'
  case 'monochrome':
    // Вариации оттенка в пределах ±20 от базового
    const hueVariation = baseHue + (Math.random() * 40 - 20)
    return 'hsl(' + hueVariation + ', 100%, 50%)'
  case 'pastel':
    return 'hsl(' + hue + ', 70%, 80%)'
  default:
    return 'hsl(' + hue + ', 100%, 50%)'
  }
}

function displayInfo() {
  if (!showHelp) return

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  const boxW = 360
  const boxH = 230
  const boxX = (canvas.width - boxW) / 2
  const boxY = (canvas.height - boxH) / 2
  ctx.fillRect(boxX, boxY, boxW, boxH)

  ctx.font = '16px Arial'
  ctx.fillStyle = 'white'
  ctx.textAlign = 'left'
  const x = boxX + 20
  let y = boxY + 35
  const lines = [
    'i — показать/скрыть справку',
    '\u2191 \u2193 — размер частиц',
    '\u2190 \u2192 — расстояние соединения',
    '+ / - — количество частиц',
    '1 — радуга  2 — монохром  3 — пастель',
    'q — сменить оттенок (монохром)',
    'c / v — скорость затухания',
  ]
  for (const line of lines) {
    ctx.fillText(line, x, y)
    y += 26
  }
  ctx.restore()
}
