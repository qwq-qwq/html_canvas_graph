// Audio handler for microphone input
let audioContext = null;
let analyser = null;
let microphone = null;
let isAudioActive = false;

// Initialize audio context and analyser
async function initAudio() {
    try {
        // Проверяем, не инициализирован ли уже аудио контекст
        if (audioContext) {
            console.log('Audio context already exists');
            return true;
        }

        console.log('Initializing audio...');
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Создаем и настраиваем анализатор
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.8;
        
        // Запрашиваем доступ к микрофону
        console.log('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            } 
        });
        
        // Создаем источник из потока микрофона
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        isAudioActive = true;
        console.log('Audio initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing audio:', error);
        isAudioActive = false;
        return false;
    }
}

// Get current audio data
function getAudioData() {
    if (!isAudioActive || !analyser) {
        console.log('Audio not active or analyser not initialized');
        return null;
    }
    
    try {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Разделяем частоты на диапазоны для более детального анализа
        const bassRange = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10;
        const midRange = dataArray.slice(10, 100).reduce((a, b) => a + b) / 90;
        const highRange = dataArray.slice(100).reduce((a, b) => a + b) / (dataArray.length - 100);
        
        // Вычисляем общую громкость и нормализуем
        const average = (bassRange + midRange + highRange) / 3;
        const normalized = Math.min(1, average / 128);
        
        // Добавляем отладочную информацию каждые 100 кадров
        if (Math.random() < 0.01) {
            console.log('Audio levels:', {
                bass: bassRange / 255,
                mid: midRange / 255,
                high: highRange / 255,
                normalized
            });
        }
        
        return {
            average,
            normalized,
            bass: bassRange / 255,
            mid: midRange / 255,
            high: highRange / 255,
            frequencies: dataArray
        };
    } catch (error) {
        console.error('Error getting audio data:', error);
        return null;
    }
}

// Stop audio processing
function stopAudio() {
    console.log('Stopping audio...');
    if (microphone) {
        microphone.disconnect();
        microphone = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
    isAudioActive = false;
    console.log('Audio stopped');
} 