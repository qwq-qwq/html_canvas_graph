#!/bin/bash

# Мастер-скрипт для настройки и деплоя HTML Canvas Graph с Jenkins
# Запустите этот скрипт на вашем сервере Digital Ocean

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Без цвета

# Проверка наличия root-прав
if [ "$(id -u)" != "0" ]; then
   echo -e "${RED}Этот скрипт должен быть запущен с правами root${NC}" 
   exit 1
fi

# Создание директорий для проекта
echo -e "${YELLOW}Создание директорий для проекта...${NC}"
mkdir -p /opt/canvas-graph/nginx/conf.d
mkdir -p /opt/canvas-graph/nginx/ssl
cd /opt/canvas-graph

# Проверка и установка Docker
echo -e "${YELLOW}Проверка и установка Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker не найден. Установка Docker...${NC}"
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt-get update
    apt-get install -y docker-ce
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker установлен успешно${NC}"
else
    echo -e "${GREEN}Docker уже установлен${NC}"
fi

# Проверка и установка Docker Compose
echo -e "${YELLOW}Проверка и установка Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose не найден. Установка Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    echo -e "${GREEN}Docker Compose установлен успешно${NC}"
else
    echo -e "${GREEN}Docker Compose уже установлен${NC}"
fi

# Копирование файлов конфигурации
echo -e "${YELLOW}Копирование файлов конфигурации...${NC}"

# Создание docker-compose.yml для Jenkins
cat > jenkins-docker-compose.yml << 'EOF'
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    restart: unless-stopped
    privileged: true
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
      - /usr/local/bin/docker-compose:/usr/local/bin/docker-compose
    environment:
      - TZ=Europe/Kiev
    networks:
      - app-network

  # Опционально: Nginx для проксирования запросов к Jenkins
  nginx:
    image: nginx:alpine
    container_name: jenkins-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - jenkins
    networks:
      - app-network

volumes:
  jenkins_home:

networks:
  app-network:
    driver: bridge
EOF

# Создание конфигурации Nginx
cat > nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name canvas.perek.rest;  # Замените на ваш домен, если он есть
    
    # Редирект на HTTPS (раскомментируйте при настройке SSL)
    # return 301 https://$host$request_uri;
    
    # Проксирование запросов к приложению HTML Canvas Graph
    location / {
        proxy_pass http://canvas-app:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Проксирование запросов к Jenkins
    location /jenkins {
        proxy_pass http://jenkins:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Настройки для работы Jenkins
        proxy_redirect http://jenkins:8080 $scheme://$host/jenkins;
        proxy_http_version 1.1;
        proxy_request_buffering off;
        proxy_buffering off;
        
        # Поддержка веб-сокетов для Blue Ocean и других функций
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Таймауты для длительных операций
        proxy_read_timeout 900s;
        proxy_connect_timeout 900s;
        proxy_send_timeout 900s;
        
        # Заголовок для корректной работы Jenkins в подпапке
        proxy_set_header X-Forwarded-Prefix /jenkins;
    }
    
    # Файлы для проверки доменов Let's Encrypt (при необходимости)
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
EOF

# Запуск Jenkins
echo -e "${YELLOW}Запуск Jenkins...${NC}"
docker-compose -f jenkins-docker-compose.yml up -d

# Ожидание запуска Jenkins
echo -e "${YELLOW}Ожидание запуска Jenkins...${NC}"
sleep 30

# Получение пароля администратора Jenkins
JENKINS_PASSWORD=$(docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null)
if [ ! -z "$JENKINS_PASSWORD" ]; then
    echo -e "${GREEN}Jenkins запущен. Административный пароль:${NC}"
    echo -e "${YELLOW}$JENKINS_PASSWORD${NC}"
else
    echo -e "${RED}Не удалось получить пароль администратора Jenkins. Проверьте логи контейнера.${NC}"
    docker logs jenkins
fi

# Получение IP-адреса сервера
SERVER_IP=$(hostname -I | awk '{print $1}')

# Настройка Jenkins для работы в подпапке
echo -e "${YELLOW}Настройка Jenkins для работы в подпапке...${NC}"
docker exec jenkins bash -c "mkdir -p /var/jenkins_home/init.groovy.d/"
cat > /tmp/set-prefix.groovy << EOF
import jenkins.model.Jenkins

def jenkins = Jenkins.instance
jenkins.setRootUrl("http://${SERVER_IP}/jenkins/")
jenkins.save()
EOF
docker cp /tmp/set-prefix.groovy jenkins:/var/jenkins_home/init.groovy.d/set-prefix.groovy
rm /tmp/set-prefix.groovy

# Создание файла конфигурации для корректной работы Jenkins в подпапке
echo -e "${YELLOW}Создание файла конфигурации для jenkins.model.JenkinsLocationConfiguration.xml...${NC}"
cat > /tmp/jenkins.model.JenkinsLocationConfiguration.xml << EOF
<?xml version='1.1' encoding='UTF-8'?>
<jenkins.model.JenkinsLocationConfiguration>
  <adminAddress>admin@example.com</adminAddress>
  <jenkinsUrl>http://${SERVER_IP}/jenkins/</jenkinsUrl>
</jenkins.model.JenkinsLocationConfiguration>
EOF
docker cp /tmp/jenkins.model.JenkinsLocationConfiguration.xml jenkins:/var/jenkins_home/jenkins.model.JenkinsLocationConfiguration.xml
rm /tmp/jenkins.model.JenkinsLocationConfiguration.xml

# Перезапуск Jenkins для применения настроек
echo -e "${YELLOW}Перезапуск Jenkins для применения настроек...${NC}"
docker restart jenkins

# Информация о доступе
echo -e "${GREEN}Установка завершена!${NC}"
echo -e "${YELLOW}Jenkins доступен по адресу: http://${SERVER_IP}/jenkins/${NC}"
echo -e "${YELLOW}После настройки Jenkins, ваше приложение HTML Canvas Graph будет доступно по адресу: http://${SERVER_IP}/${NC}"

# Инструкции по дальнейшей настройке
echo -e "${YELLOW}Дальнейшие шаги:${NC}"
echo -e "1. Завершите первоначальную настройку Jenkins по адресу: http://${SERVER_IP}/jenkins/"
echo -e "2. Установите рекомендуемые плагины"
echo -e "3. Создайте пайплайн Jenkins, указав путь к вашему Git-репозиторию"
echo -e "4. Настройте вебхуки для автоматического запуска сборки при пуше в репозиторий" 