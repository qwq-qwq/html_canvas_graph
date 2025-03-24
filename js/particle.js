// Класс для частиц
class Particle {
  constructor() {
    // В аудио режиме создаем частицы в случайном месте с начальной скоростью от центра
    if (drawMode === 'audioParticles') {
      // Вычисляем направление от центра экрана
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(canvas.width, canvas.height) * 0.2; // Уменьшаем область появления
      
      // Устанавливаем позицию относительно центра
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      this.x = centerX + Math.cos(angle) * distance;
      this.y = centerY + Math.sin(angle) * distance;
      
      // Начальная скорость направлена от центра
      const speed = Math.random() * 1 + 0.5; // Уменьшаем начальную скорость
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed;
    } else {
      // Обычный режим - создаем частицы у курсора
      this.x = mouse.x;
      this.y = mouse.y;
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * 6 - 3;
    }

    // Уменьшаем базовый размер частиц для аудио режима
    if (drawMode === 'audioParticles') {
      this.size = Math.random() * (particleSize * 0.3) + 0.5;
    } else {
      this.size = Math.random() * particleSize + 1;
    }
    
    this.color = getParticleColor();

    // Добавляем гравитацию и затухание
    this.gravity = 0.01; // Уменьшаем гравитацию
    this.friction = 0.99;

    // Время жизни частицы (от 100 до 200 обновлений)
    this.life = 100 + Math.random() * 100;
    this.opacity = 1;

    // Добавляем параметры для аудио-движения
    this.audioSpeed = Math.random() * 2 + 1; // Уменьшаем скорость аудио-движения
    this.audioAngle = Math.random() * Math.PI * 2;
    this.audioAmplitude = Math.random() * 30 + 10; // Уменьшаем амплитуду
    this.audioFrequency = Math.random() * 2 + 1;
    this.audioPhase = Math.random() * Math.PI * 2;
  }

  update() {
    // Применяем гравитацию и трение
    this.speedY += this.gravity;
    this.speedX *= this.friction;
    this.speedY *= this.friction;

    // Добавляем аудио-движение если режим активен
    if (drawMode === 'audioParticles') {
      if (!isAudioActive) {
        console.log('Audio mode is active but audio is not initialized');
        return;
      }

      const audioData = getAudioData();
      if (audioData) {
        // Используем разные частотные диапазоны для разных эффектов
        const bassInfluence = audioData.bass * this.audioAmplitude * 2;
        const midInfluence = audioData.mid * this.audioAmplitude;
        const highInfluence = audioData.high * this.audioAmplitude * 0.5;
        
        // Комбинируем влияние разных частот
        const audioInfluence = (bassInfluence + midInfluence + highInfluence) / 3;
        
        // Добавляем колебательное движение
        const oscillation = Math.sin(this.audioPhase + this.audioFrequency) * audioInfluence;
        
        // Добавляем движение в зависимости от аудио (уменьшаем влияние)
        this.speedX += Math.cos(this.audioAngle) * audioInfluence * this.audioSpeed * 0.05;
        this.speedY += Math.sin(this.audioAngle) * audioInfluence * this.audioSpeed * 0.05;
        
        // Добавляем колебательное движение (уменьшаем влияние)
        this.speedX += Math.cos(this.audioAngle + Math.PI/2) * oscillation * this.audioSpeed * 0.05;
        this.speedY += Math.sin(this.audioAngle + Math.PI/2) * oscillation * this.audioSpeed * 0.05;
        
        // Изменяем размер частицы в зависимости от аудио (уменьшаем влияние)
        this.size = Math.max(0.2, this.size + (audioInfluence * 0.5));
        
        // Обновляем фазу колебаний
        this.audioPhase += 0.1;
      }
    }

    this.x += this.speedX;
    this.y += this.speedY;

    // Отражение от краев экрана
    if (this.x <= 0 || this.x >= canvas.width) {
      this.speedX *= -0.7;
    }
    if (this.y <= 0 || this.y >= canvas.height) {
      this.speedY *= -0.7;
    }

    // Уменьшаем размер медленнее
    if (this.size > 0.2) {
      this.size -= 0.05;
    }

    // Уменьшаем время жизни и прозрачность
    this.life--;
    if (this.life < 50) {
      this.opacity = this.life / 50;
    }
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function handleParticles() {
  for(let i = 0; i < particleArray.length; i++) {
    particleArray[i].update()
    particleArray[i].draw()

    // Соединение линиями
    for (let j = i; j < particleArray.length; j++) {
      const dx = particleArray[i].x - particleArray[j].x
      const dy = particleArray[i].y - particleArray[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < connectionDistance) {
        // Устанавливаем прозрачность линии в зависимости от расстояния
        const opacity = 1 - (distance / connectionDistance)

        ctx.beginPath()
        ctx.strokeStyle = particleArray[i].color
        ctx.globalAlpha = opacity * particleArray[i].opacity * particleArray[j].opacity
        ctx.lineWidth = 0.2
        ctx.moveTo(particleArray[i].x, particleArray[i].y)
        ctx.lineTo(particleArray[j].x, particleArray[j].y)
        ctx.stroke()
        ctx.closePath()
        ctx.globalAlpha = 1
      }
    }

    // Удаляем частицы, которые слишком маленькие или время жизни закончилось
    if (particleArray[i].size <= 0.3 || particleArray[i].life <= 0) {
      particleArray.splice(i, 1)
      i--
    }
  }
}