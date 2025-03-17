# Настройка мониторинга и кэширования для HTML Canvas Graph

Этот документ описывает настройку системы мониторинга с использованием Prometheus и Grafana, а также кэширование данных с помощью Redis для приложения HTML Canvas Graph.

## Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Настройка Prometheus](#настройка-prometheus)
3. [Настройка Grafana](#настройка-grafana)
4. [Настройка Redis](#настройка-redis)
5. [Интеграция с приложением HTML Canvas Graph](#интеграция-с-приложением)
6. [Полезные команды для обслуживания](#полезные-команды)

## Обзор архитектуры

Наша система мониторинга и кэширования включает:

- **Prometheus**: сбор и хранение метрик
- **Grafana**: визуализация метрик из Prometheus
- **Redis**: кэширование данных для повышения производительности

Все компоненты развертываются как контейнеры Docker в единой сети для обеспечения связи между ними.

## Настройка Prometheus

### Создание конфигурационного файла

1. Создайте директорию для конфигурации Prometheus:
   ```bash
   mkdir -p /opt/canvas-graph/prometheus
   ```

2. Создайте файл конфигурации `/opt/canvas-graph/prometheus/prometheus.yml`:
   ```yaml
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
   ```

### Добавление Node Exporter (опционально)

Для мониторинга состояния хоста добавьте Node Exporter в `docker-compose.yml`:

```yaml
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
```

## Настройка Grafana

### Инициализация дашбордов

1. Создайте директорию для хранения конфигурации Grafana:
   ```bash
   mkdir -p /opt/canvas-graph/grafana/{dashboards,provisioning}
   mkdir -p /opt/canvas-graph/grafana/provisioning/{datasources,dashboards}
   ```

2. Создайте файл источника данных `/opt/canvas-graph/grafana/provisioning/datasources/prometheus.yml`:
   ```yaml
   apiVersion: 1

   datasources:
     - name: Prometheus
       type: prometheus
       access: proxy
       url: http://prometheus:9090
       isDefault: true
       editable: false
   ```

3. Создайте файл настройки дашбордов `/opt/canvas-graph/grafana/provisioning/dashboards/dashboard.yml`:
   ```yaml
   apiVersion: 1

   providers:
     - name: 'Default'
       folder: ''
       type: file
       disableDeletion: false
       editable: true
       options:
         path: /var/lib/grafana/dashboards
   ```

### Обновление docker-compose.yml

Добавьте дополнительные тома для хранения конфигурации Grafana:

```yaml
grafana:
  # ... существующая конфигурация ...
  volumes:
    - grafana_data:/var/lib/grafana
    - ./grafana/provisioning:/etc/grafana/provisioning
    - ./grafana/dashboards:/var/lib/grafana/dashboards
```

## Настройка Redis

### Создание конфигурационного файла Redis

1. Создайте директорию для конфигурации Redis:
   ```bash
   mkdir -p /opt/canvas-graph/redis
   ```

2. Создайте файл конфигурации `/opt/canvas-graph/redis/redis.conf`:
   ```
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
   ```

3. Обновите конфигурацию Redis в docker-compose.yml:
   ```yaml
   redis:
     # ... существующая конфигурация ...
     volumes:
       - redis_data:/data
       - ./redis/redis.conf:/usr/local/etc/redis/redis.conf
     command: redis-server /usr/local/etc/redis/redis.conf
   ```

## Интеграция с приложением HTML Canvas Graph

### Экспорт метрик для Prometheus

1. Добавьте библиотеку мониторинга в ваше приложение (например, prometheus-client для Node.js или Python).

2. Пример реализации экспорта метрик в Node.js:
   ```javascript
   const express = require('express');
   const client = require('prom-client');
   const app = express();

   // Создание счетчиков и метрик
   const httpRequestsTotal = new client.Counter({
     name: 'http_requests_total',
     help: 'Total number of HTTP requests',
     labelNames: ['method', 'route', 'status']
   });

   const httpRequestDuration = new client.Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status'],
     buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
   });

   // Регистрация встроенных метрик
   client.collectDefaultMetrics();

   // Маршрут для Prometheus
   app.get('/metrics', (req, res) => {
     res.set('Content-Type', client.register.contentType);
     res.end(client.register.metrics());
   });

   // Middleware для измерения времени выполнения запросов
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       httpRequestsTotal.inc({
         method: req.method,
         route: req.route ? req.route.path : req.path,
         status: res.statusCode
       });
       httpRequestDuration.observe(
         {
           method: req.method,
           route: req.route ? req.route.path : req.path,
           status: res.statusCode
         },
         duration / 1000
       );
     });
     next();
   });
   ```

### Интеграция с Redis

1. Пример использования Redis для кэширования в Node.js:
   ```javascript
   const redis = require('redis');
   const { promisify } = require('util');

   const client = redis.createClient({
     host: 'redis',
     port: 6379
   });

   const getAsync = promisify(client.get).bind(client);
   const setAsync = promisify(client.set).bind(client);

   // Пример функции с кэшированием
   async function getGraphData(graphId) {
     // Попытка получить данные из кэша
     const cacheKey = `graph:${graphId}`;
     const cachedData = await getAsync(cacheKey);
     
     if (cachedData) {
       return JSON.parse(cachedData);
     }
     
     // Если данных нет в кэше, получаем их из базы данных
     const data = await fetchDataFromDatabase(graphId);
     
     // Сохраняем данные в кэше на 5 минут (300 секунд)
     await setAsync(cacheKey, JSON.stringify(data), 'EX', 300);
     
     return data;
   }
   ```

## Полезные команды для обслуживания

### Проверка статуса сервисов
```bash
docker-compose ps
```

### Просмотр логов
```bash
# Логи Prometheus
docker-compose logs -f prometheus

# Логи Grafana
docker-compose logs -f grafana

# Логи Redis
docker-compose logs -f redis
```

### Подключение к Redis CLI
```bash
docker exec -it redis redis-cli
```

### Статистика Redis
```bash
docker exec -it redis redis-cli info
```

### Перезапуск сервисов
```bash
docker-compose restart prometheus
docker-compose restart grafana
docker-compose restart redis
```

### Резервное копирование данных Redis
```bash
docker exec -it redis redis-cli SAVE
docker cp redis:/data/dump.rdb /backup/redis-backup-$(date +%Y%m%d).rdb
```

## Безопасность

### Prometheus

1. Настройте базовую аутентификацию для Prometheus, добавив в `nginx/conf.d/default.conf`:
   ```
   location /prometheus/ {
       auth_basic "Prometheus";
       auth_basic_user_file /etc/nginx/.htpasswd;
       proxy_pass http://prometheus:9090/;
       # ... остальные настройки прокси ...
   }
   ```

### Grafana

1. Измените пароль по умолчанию при первом входе в Grafana.
2. Настройте HTTPS для Grafana через Nginx.

### Redis

1. Настройте пароль для Redis, добавив в `redis.conf`:
   ```
   requirepass your_strong_password
   ```

2. Обновите подключения клиентов для использования пароля. 