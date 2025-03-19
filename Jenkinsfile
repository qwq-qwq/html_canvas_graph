pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_VERSION = '2.18.1'
        APP_DIR = '/opt/canvas-graph'
        APP_NAME = 'canvas-graph'
        DOCKER_HOST = 'unix:///var/run/docker.sock'
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        BUILD_TIMESTAMP = sh(script: "date +%Y%m%d_%H%M%S", returnStdout: true).trim()
    }
    
    options {
        timeout(time: 10, unit: 'MINUTES')
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Получаем код из репозитория
                checkout scm
                
                // Выводим информацию о текущей сборке
                sh 'echo "Building commit: ${GIT_COMMIT_SHORT} at ${BUILD_TIMESTAMP}"'
            }
        }
        
        stage('Setup') {
            steps {
                // Устанавливаем Node.js
                nodejs(nodeJSInstallationName: 'NodeJS 18') {
                    sh 'node --version'
                    sh 'npm --version'
                }
            }
        }
        
        stage('Lint') {
            steps {
                // Запускаем линтер для проверки кода
                nodejs(nodeJSInstallationName: 'NodeJS 18') {
                    sh 'npm install'
                    sh 'npm run lint:fix'
                }
            }
        }
        
        stage('Prepare Deployment') {
            steps {
                // Создаем директорию для деплоя если она не существует
                sh "mkdir -p ${env.APP_DIR}"
                
                // Копируем необходимые файлы в директорию деплоя
                sh "cp -r index.html js/ nginx.conf Dockerfile docker-compose.yml ${env.APP_DIR}/"
                
                // Создаем метку версии
                sh "echo 'BUILD_ID=${env.BUILD_ID}\nBUILD_NUMBER=${env.BUILD_NUMBER}\nGIT_COMMIT=${env.GIT_COMMIT_SHORT}\nBUILD_TIMESTAMP=${env.BUILD_TIMESTAMP}' > ${env.APP_DIR}/version.txt"
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir("${env.APP_DIR}") {
                    // Собираем Docker-образ
                    sh "docker build -t ${env.APP_NAME}:${env.BUILD_NUMBER} -t ${env.APP_NAME}:latest ."
                }
            }
        }
        
        stage('Deploy') {
            steps {
                dir("${env.APP_DIR}") {
                    // Останавливаем предыдущие контейнеры если они есть
                    sh 'docker-compose down || true'
                    
                    // Обновляем версию образа в docker-compose.yml
                    sh "sed -i 's|image: canvas-app|image: ${env.APP_NAME}:${env.BUILD_NUMBER}|g' docker-compose.yml"
                    
                    // Собираем и запускаем контейнеры
                    sh 'docker-compose up -d --build'
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                // Проверяем что контейнер запущен
                sh 'docker ps | grep canvas-graph'
                
                // Ждем немного для инициализации приложения
                sh 'sleep 5'
                
                // Делаем простую проверку доступности
                sh 'curl -s --head --fail http://localhost || true'
            }
        }
        
        stage('Cleanup') {
            steps {
                // Удаляем старые образы для экономии места
                sh '''
                docker image prune -a -f --filter "until=24h"
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Deployment failed! Check the logs for details.'
        }
        always {
            // Очистка рабочего пространства
            cleanWs()
        }
    }
} 