pipeline {
    agent any
    
    environment {
        // Настройки приложения
        APP_NAME = "graph"
        APP_DIR = "/opt/projects/${APP_NAME}"

        // Настройки Docker
        DOCKER_HOST = "unix:///var/run/docker.sock"

        // Информация о сборке
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
        
        stage('Build Static Files') {
            steps {
                // Пример сборки статических файлов (если требуется)
                // Например, минификация JS, компиляция SASS и т.д.
                sh 'echo "Building static files..."'

                // Если требуется сборка с использованием npm/yarn
                // sh 'npm install && npm run build'
            }
        }
        
        //stage('Build Docker Image') {
        //    steps {
        //        // Собираем Docker-образ
        //        sh "docker build -t ${env.APP_NAME}:${env.BUILD_NUMBER} -t ${env.APP_NAME}:latest ."
        //    }
        //}
        
        stage('Prepare Deployment') {
            steps {
                // Создаем директорию для деплоя если она не существует
                sh "mkdir -p ${env.APP_DIR}/html ${env.APP_DIR}/html/js ${env.APP_DIR}/nginx/conf.d"
                
                // Копируем необходимые файлы в директорию деплоя
                sh "cp -r index.html ${env.APP_DIR}/html/"
                sh "cp -r js/* ${env.APP_DIR}/html/js"
                sh "cp -r nginx/conf.d/* ${env.APP_DIR}/nginx/conf.d/"
                sh "cp docker-compose.yml ${env.APP_DIR}/"
                
                // Создаем метку версии
                sh "echo 'BUILD_ID=${env.BUILD_ID}\nBUILD_NUMBER=${env.BUILD_NUMBER}\nGIT_COMMIT=${env.GIT_COMMIT_SHORT}\nBUILD_TIMESTAMP=${env.BUILD_TIMESTAMP}' > ${env.APP_DIR}/version.txt"
            }
        }

        stage('Deploy') {
            steps {
                dir("${env.APP_DIR}") {
                    // Останавливаем предыдущие контейнеры если они есть
                    sh 'docker-compose down || true'
                    
                    // Запускаем контейнеры
                    sh 'docker-compose up -d'
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                // Проверяем что контейнер запущен
                sh "docker ps | grep ${env.APP_NAME}-nginx"
                
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