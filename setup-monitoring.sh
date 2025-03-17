#!/bin/bash

# Цвета для вывода в терминал
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений с цветами
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка на root-права
if [ "$EUID" -ne 0 ]; then
    print_error "Пожалуйста, запустите скрипт с правами root (sudo)"
    exit 1
fi

# Путь к проекту
PROJECT_DIR="/opt/canvas-graph"

# Проверка, существует ли директория проекта
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Директория проекта $PROJECT_DIR не существует. Запустите сначала deploy-master.sh"
    exit 1
fi

print_message "Настройка мониторинга и кэширования для HTML Canvas Graph..."

# Создание директорий для конфигурации
print_message "Создание директорий для конфигурации..."
mkdir -p $PROJECT_DIR/prometheus
mkdir -p $PROJECT_DIR/grafana/{dashboards,provisioning}
mkdir -p $PROJECT_DIR/grafana/provisioning/{datasources,dashboards}
mkdir -p $PROJECT_DIR/redis

# Создание конфигурационного файла для Prometheus
print_message "Создание конфигурации Prometheus..."
cat > $PROJECT_DIR/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

rule_files:
  # - "first_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'canvas-app'
    static_configs:
      - targets: ['canvas-graph:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# Создание конфигурации Grafana - источники данных
print_message "Создание конфигурации Grafana - источники данных..."
cat > $PROJECT_DIR/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
EOF

# Создание конфигурации Grafana - дашборды
print_message "Создание конфигурации Grafana - дашборды..."
cat > $PROJECT_DIR/grafana/provisioning/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'Default'
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Создание примера дашборда
print_message "Создание примера дашборда для Canvas Graph..."
cat > $PROJECT_DIR/grafana/dashboards/canvas-graph-dashboard.json << 'EOF'
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 9,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 2,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.3.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "http_requests_total",
          "interval": "",
          "legendFormat": "{{method}} {{route}} ({{status}})",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "HTTP Requests Total",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 9,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 4,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.3.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])",
          "interval": "",
          "legendFormat": "{{method}} {{route}} ({{status}})",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "HTTP Requests Duration (5m avg)",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "s",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    }
  ],
  "refresh": "5s",
  "schemaVersion": 26,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-1h",
    "to": "now"
  },
  "timepicker": {
    "refresh_intervals": [
      "5s",
      "10s",
      "30s",
      "1m",
      "5m",
      "15m",
      "30m",
      "1h",
      "2h",
      "1d"
    ]
  },
  "timezone": "",
  "title": "Canvas Graph Dashboard",
  "uid": "canvas-graph",
  "version": 1
}
EOF

# Создание конфигурации Redis
print_message "Создание конфигурации Redis..."
cat > $PROJECT_DIR/redis/redis.conf << 'EOF'
bind 0.0.0.0
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
always-show-logo yes
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./
maxmemory 100mb
maxmemory-policy allkeys-lru
EOF

# Обновление docker-compose.yml для включения всех сервисов
print_message "Обновление docker-compose.yml..."
cat > $PROJECT_DIR/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Приложение HTML Canvas Graph
  canvas-app:
    image: canvas-graph:latest
    container_name: canvas-graph
    restart: unless-stopped
    networks:
      - app-network

  # Мониторинг
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    expose:
      - 9090
    networks:
      - app-network

  # Визуализация метрик
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=secret
      - GF_USERS_ALLOW_SIGN_UP=false
    expose:
      - 3000
    networks:
      - app-network

  # Кэширование
  redis:
    image: redis:alpine
    container_name: redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    expose:
      - 6379
    networks:
      - app-network
      
  # Мониторинг хоста
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
    expose:
      - 9100
    networks:
      - app-network

  # Автоматическое обновление контейнеров
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 86400 --cleanup
    networks:
      - app-network

volumes:
  prometheus_data:
  grafana_data:
  redis_data:

networks:
  app-network:
    external: true  # Используем внешнюю сеть для связи с Jenkins
EOF

# Обновление Nginx конфигурации для доступа к мониторингу и метрикам
print_message "Обновление Nginx конфигурации..."
cat > $PROJECT_DIR/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Настройки для обработки больших запросов
    client_max_body_size 100M;

    # Корневая директория (Canvas Graph App)
    location / {
        proxy_pass http://canvas-app:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Jenkins под /jenkins
    location /jenkins {
        proxy_pass http://jenkins:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Поддержка WebSocket для Blue Ocean
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Настройка таймаутов для долговыполняющихся операций
        proxy_connect_timeout 150;
        proxy_send_timeout 100;
        proxy_read_timeout 100;
    }
    
    # Prometheus под /prometheus
    location /prometheus/ {
        auth_basic "Prometheus";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://prometheus:9090/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Grafana под /grafana
    location /grafana/ {
        proxy_pass http://grafana:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Для поддержки websocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Node Exporter metrics под /node-metrics
    location /node-metrics/ {
        auth_basic "Node Exporter";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://node-exporter:9100/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Let's Encrypt
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }
}

# Uncomment the following lines when setting up SSL
# server {
#     listen 443 ssl http2;
#     server_name your-domain.com;
#
#     ssl_certificate /etc/nginx/ssl/live/your-domain.com/fullchain.pem;
#     ssl_certificate_key /etc/nginx/ssl/live/your-domain.com/privkey.pem;
#
#     # Другие SSL-настройки
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_prefer_server_ciphers on;
#     ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
#
#     # Перенаправление с HTTP на HTTPS
#     return 301 https://$host$request_uri;
# }
EOF

# Создание пользователя для базовой аутентификации
print_message "Создание пользователя для базовой аутентификации..."
if [ ! -f "$PROJECT_DIR/nginx/.htpasswd" ]; then
    # Установка apache2-utils, если его нет
    if ! command -v htpasswd &> /dev/null; then
        print_message "Установка apache2-utils для поддержки htpasswd..."
        apt-get update
        apt-get install -y apache2-utils
    fi
    
    # Создание файла с учетными данными
    htpasswd -bc $PROJECT_DIR/nginx/.htpasswd admin secure_password
    print_message "Создан пользователь для доступа к мониторингу (admin:secure_password)"
else
    print_warning "Файл htpasswd уже существует. Пропускаем создание."
fi

# Перезапуск Docker Compose
print_message "Перезапуск контейнеров..."
cd $PROJECT_DIR
docker-compose down
docker-compose up -d

# Проверка статуса контейнеров
print_message "Проверка статуса контейнеров..."
docker-compose ps

print_message "Настройка мониторинга и кэширования завершена!"
print_message "Доступ к сервисам:"
print_message "- Приложение: http://ваш_ip_адрес/"
print_message "- Jenkins: http://ваш_ip_адрес/jenkins/"
print_message "- Prometheus: http://ваш_ip_адрес/prometheus/ (admin:secure_password)"
print_message "- Grafana: http://ваш_ip_адрес/grafana/ (admin:secret)"
print_message "- Node Exporter: http://ваш_ip_адрес/node-metrics/ (admin:secure_password)"

exit 0 