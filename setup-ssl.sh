#!/bin/bash

# Скрипт для настройки SSL-сертификатов с использованием Let's Encrypt
# Запускать на сервере после установки и настройки Nginx

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

# Определение переменных
DOMAIN=""
EMAIL=""
APP_DIR="/opt/canvas-graph"
NGINX_CONF_DIR="$APP_DIR/nginx/conf.d"
NGINX_SSL_DIR="$APP_DIR/nginx/ssl"

# Функция для отображения помощи
show_usage() {
    echo "Использование: $0 -d домен -e email"
    echo "  -d домен     Доменное имя для SSL-сертификата"
    echo "  -e email     Email для регистрации в Let's Encrypt"
    exit 1
}

# Парсинг аргументов командной строки
while getopts ":d:e:" opt; do
    case $opt in
        d) DOMAIN="$OPTARG" ;;
        e) EMAIL="$OPTARG" ;;
        \?) echo "Неверный параметр: -$OPTARG" >&2; show_usage ;;
        :) echo "Параметр -$OPTARG требует аргумента." >&2; show_usage ;;
    esac
done

# Проверка обязательных параметров
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}Ошибка: Требуются домен и email.${NC}"
    show_usage
fi

echo -e "${YELLOW}Настройка SSL-сертификатов для домена $DOMAIN...${NC}"

# Создание директорий для certbot
mkdir -p /var/www/certbot

# Установка certbot, если он не установлен
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Установка certbot...${NC}"
    apt-get update
    apt-get install -y certbot
fi

# Создание временной конфигурации Nginx для проверки домена
cat > $NGINX_CONF_DIR/ssl-validation.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
EOF

# Перезапуск Nginx для применения временной конфигурации
echo -e "${YELLOW}Перезапуск Nginx для валидации домена...${NC}"
docker exec -it nginx nginx -s reload

# Получение SSL-сертификата с помощью certbot
echo -e "${YELLOW}Получение SSL-сертификата...${NC}"
certbot certonly --webroot -w /var/www/certbot -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email

# Проверка успешного получения сертификата
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo -e "${RED}Не удалось получить сертификат для домена $DOMAIN.${NC}"
    exit 1
fi

# Создание директории для SSL-сертификатов
mkdir -p $NGINX_SSL_DIR

# Копирование сертификатов в директорию Nginx
echo -e "${YELLOW}Копирование сертификатов в директорию Nginx...${NC}"
cp -L /etc/letsencrypt/live/$DOMAIN/fullchain.pem $NGINX_SSL_DIR/
cp -L /etc/letsencrypt/live/$DOMAIN/privkey.pem $NGINX_SSL_DIR/

# Настройка прав доступа к сертификатам
chmod 644 $NGINX_SSL_DIR/fullchain.pem
chmod 600 $NGINX_SSL_DIR/privkey.pem

# Обновление конфигурации Nginx для использования SSL
cat > $NGINX_CONF_DIR/default.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Редирект с HTTP на HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
    
    # Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL-сертификаты
    ssl_certificate $NGINX_SSL_DIR/fullchain.pem;
    ssl_certificate_key $NGINX_SSL_DIR/privkey.pem;
    
    # Оптимальные настройки SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Настройки для обработки больших запросов
    client_max_body_size 100M;

    # Проксирование запросов к приложению HTML Canvas Graph
    location / {
        proxy_pass http://canvas-app:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Jenkins под /jenkins
    location /jenkins {
        proxy_pass http://jenkins:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Поддержка WebSocket для Blue Ocean
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Настройка таймаутов для долговыполняющихся операций
        proxy_connect_timeout 150;
        proxy_send_timeout 100;
        proxy_read_timeout 100;
        
        # Заголовок для корректной работы Jenkins в подпапке
        proxy_set_header X-Forwarded-Prefix /jenkins;
    }
    
    # Prometheus под /prometheus
    location /prometheus/ {
        auth_basic "Prometheus";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://prometheus:9090/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Grafana под /grafana
    location /grafana/ {
        proxy_pass http://grafana:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Для поддержки websocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Node Exporter metrics под /node-metrics
    location /node-metrics/ {
        auth_basic "Node Exporter";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://node-exporter:9100/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Перезапуск Nginx для применения новой конфигурации
echo -e "${YELLOW}Перезапуск Nginx для применения SSL-конфигурации...${NC}"
docker exec -it nginx nginx -s reload

# Настройка автоматического обновления сертификатов
echo -e "${YELLOW}Настройка автоматического обновления сертификатов...${NC}"
cat > /etc/cron.d/certbot << EOF
0 3 * * * root certbot renew --quiet --post-hook "cp -L /etc/letsencrypt/live/$DOMAIN/fullchain.pem $NGINX_SSL_DIR/ && cp -L /etc/letsencrypt/live/$DOMAIN/privkey.pem $NGINX_SSL_DIR/ && docker exec -it nginx nginx -s reload"
EOF

echo -e "${GREEN}Настройка SSL-сертификатов завершена!${NC}"
echo -e "${GREEN}Ваше приложение теперь доступно по адресу https://$DOMAIN/${NC}"
echo -e "${GREEN}Jenkins доступен по адресу https://$DOMAIN/jenkins/${NC}"

# Дополнительные инструкции
echo -e "${YELLOW}Дополнительная информация:${NC}"
echo -e "1. Сертификаты Let's Encrypt действительны в течение 90 дней"
echo -e "2. Настроено автоматическое обновление сертификатов через cron"
echo -e "3. Для проверки настройки SSL используйте сервис SSL Labs: https://www.ssllabs.com/ssltest/" 