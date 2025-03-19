# Руководство по деплою HTML Canvas Graph

В этом руководстве описаны шаги для настройки и развертывания приложения HTML Canvas Graph на сервере Digital Ocean вместе с CI/CD, мониторингом и кэшированием.

## Обзор процесса деплоя

Процесс деплоя состоит из нескольких шагов:

1. **Инициализация сервера** - базовая настройка нового сервера
2. **Первичный деплой** - установка Docker, Jenkins и базовой инфраструктуры
3. **Настройка мониторинга** - установка Prometheus, Grafana и Redis
4. **Настройка SSL** - добавление HTTPS-шифрования с Let's Encrypt
5. **Настройка CI/CD** - конфигурация Jenkins для автоматического деплоя

## Необходимые компоненты

* Сервер на Digital Ocean (рекомендуется минимум 2GB RAM)
* Доменное имя (опционально, для настройки SSL)
* SSH-доступ к серверу
* Git-репозиторий с вашим приложением HTML Canvas Graph

## Пошаговая инструкция

### Шаг 1: Инициализация нового сервера

**На новом сервере:**

1. Скопируйте скрипт `init-server.sh` на ваш сервер:
   ```bash
   scp init-server.sh root@ВАШ_IP:/root/
   ```

2. Подключитесь к серверу и запустите скрипт:
   ```bash
   ssh root@ВАШ_IP
   chmod +x init-server.sh
   ./init-server.sh
   ```

3. Следуйте инструкциям скрипта. Рекомендуется создать нового пользователя с sudo правами.

4. После завершения скрипта перезагрузите сервер:
   ```bash
   reboot
   ```

### Шаг 2: Первичный деплой

**На локальной машине:**

1. Запустите скрипт `deploy.sh` для первичной настройки:
   ```bash
   ./deploy.sh -i ВАШ_IP -u root
   ```
   Если вы используете SSH-ключ, добавьте параметр `-k ПУТЬ_К_КЛЮЧУ`.

2. Скрипт выполнит следующие действия:
   - Копирование необходимых файлов на сервер
   - Запуск скрипта `deploy-master.sh` на сервере
   - Установка Docker и Docker Compose
   - Настройка и запуск Jenkins

3. После завершения скрипта, Jenkins будет доступен по адресу `http://ВАШ_IP/jenkins/`

4. Завершите первоначальную настройку Jenkins через веб-интерфейс, используя временный пароль из вывода скрипта.

### Шаг 3: Настройка мониторинга и кэширования

**На сервере:**

1. Подключитесь к серверу:
   ```bash
   ssh root@ВАШ_IP
   ```

2. Перейдите в директорию проекта и запустите скрипт настройки мониторинга:
   ```bash
   cd /opt/canvas-graph
   ./setup-monitoring.sh
   ```

3. После завершения скрипта, будут доступны:
   - Prometheus: `http://ВАШ_IP/prometheus/` (admin:secure_password)
   - Grafana: `http://ВАШ_IP/grafana/` (admin:secret)
   - Node Exporter: `http://ВАШ_IP/node-metrics/` (admin:secure_password)

### Шаг 4: Настройка SSL-сертификатов (если есть доменное имя)

**На сервере:**

1. Подключитесь к серверу:
   ```bash
   ssh root@ВАШ_IP
   ```

2. Перейдите в директорию проекта и запустите скрипт настройки SSL:
   ```bash
   cd /opt/canvas-graph
   ./setup-ssl.sh -d ваш-домен.com -e ваш-email@example.com
   ```

3. После завершения скрипта, приложение будет доступно по HTTPS:
   - Приложение: `https://ваш-домен.com/`
   - Jenkins: `https://ваш-домен.com/jenkins/`
   - Prometheus: `https://ваш-домен.com/prometheus/`
   - Grafana: `https://ваш-домен.com/grafana/`

### Шаг 5: Настройка CI/CD в Jenkins

1. Откройте Jenkins в браузере: `http://ВАШ_IP/jenkins/` или `https://ваш-домен.com/jenkins/` (если SSL настроен)

2. Создайте новый Pipeline:
   - Перейдите в "New Item"
   - Выберите "Pipeline" и введите имя проекта
   - В разделе "Pipeline" выберите "Pipeline script from SCM"
   - Выберите "Git" в SCM
   - Введите URL вашего Git-репозитория
   - Укажите ветку (обычно "*/main" или "*/master")
   - В "Script Path" укажите "Jenkinsfile"
   - Сохраните конфигурацию

3. Настройка вебхуков для автоматического запуска сборки:
   - Перейдите в настройки вашего репозитория на GitHub/GitLab
   - Добавьте вебхук с URL `http://ВАШ_IP/jenkins/github-webhook/` или `https://ваш-домен.com/jenkins/github-webhook/`
   - Выберите события для запуска (обычно "Push events")

4. Запустите первую сборку вручную, чтобы проверить работоспособность.

## Обслуживание и обновление

### Обновление приложения

Для обновления приложения просто выполните push в ваш Git-репозиторий. Jenkins автоматически запустит сборку и деплой.

### Обновление инфраструктуры

Для обновления компонентов инфраструктуры (Docker, Jenkins, Prometheus, Grafana):

```bash
ssh root@ВАШ_IP
cd /opt/canvas-graph
docker-compose pull
docker-compose up -d
```

### Резервное копирование

Рекомендуется регулярно создавать резервные копии важных данных:

```bash
ssh root@ВАШ_IP
cd /opt/canvas-graph
docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword > jenkins_admin_password.txt
docker-compose exec jenkins tar czf /tmp/jenkins_home.tar.gz /var/jenkins_home
docker cp jenkins:/tmp/jenkins_home.tar.gz ./jenkins_backup_$(date +%Y%m%d).tar.gz

# Резервное копирование Redis (если используется)
docker-compose exec redis redis-cli SAVE
docker cp redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

## Устранение неполадок

### Jenkins не стартует

```bash
ssh root@ВАШ_IP
cd /opt/canvas-graph
docker logs jenkins
```

### Проблемы с Nginx

```bash
ssh root@ВАШ_IP
cd /opt/canvas-graph
docker logs nginx
docker exec -it nginx nginx -t  # Проверка конфигурации
```

### Проблемы с SSL-сертификатами

```bash
ssh root@ВАШ_IP
certbot certificates  # Проверка сертификатов
```

## Безопасность

Для повышения безопасности рекомендуется:

1. Изменить пароли по умолчанию в Grafana и для базовой аутентификации
2. Регулярно обновлять все компоненты системы
3. Настроить брандмауэр и ограничить доступ к важным портам
4. Использовать SSH-ключи вместо паролей для доступа к серверу
5. Регулярно проверять журналы безопасности 