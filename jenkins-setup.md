# Настройка Jenkins для деплоя HTML Canvas Graph

Это руководство поможет вам настроить Jenkins на вашем сервере Digital Ocean для автоматического деплоя приложения HTML Canvas Graph.

## 1. Установка Jenkins с помощью Docker

Создайте файл `jenkins-docker-compose.yml` на вашем сервере:

```yaml
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
      - TZ=Europe/Moscow

volumes:
  jenkins_home:
```

Запустите Jenkins:

```bash
docker-compose -f jenkins-docker-compose.yml up -d
```

## 2. Первоначальная настройка Jenkins

1. Откройте Jenkins в браузере: `http://ваш_ip_адрес:8080`

2. Получите пароль администратора:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```

3. Установите рекомендуемые плагины и создайте учетную запись администратора.

## 3. Установка необходимых плагинов

Установите следующие плагины через "Manage Jenkins" > "Manage Plugins":
- Docker Pipeline
- NodeJS Plugin
- Blue Ocean (опционально, для улучшенного интерфейса)

## 4. Настройка инструментов

### Настройка Node.js

1. Перейдите в "Manage Jenkins" > "Global Tool Configuration"
2. В разделе "NodeJS" нажмите "Add NodeJS"
3. Укажите имя (например, "NodeJS 18") и выберите версию (например, "NodeJS 18.x")
4. Сохраните настройки

## 5. Создание пайплайна

1. На главной странице Jenkins нажмите "New Item"
2. Введите имя проекта (например, "canvas-graph")
3. Выберите "Pipeline" и нажмите "OK"
4. В разделе "Pipeline" выберите "Pipeline script from SCM"
5. В поле "SCM" выберите "Git"
6. Введите URL вашего репозитория
7. Укажите учетные данные для доступа к репозиторию (если требуется)
8. В поле "Script Path" введите "Jenkinsfile"
9. Сохраните настройки

## 6. Настройка вебхуков (опционально)

Для автоматического запуска сборки при пуше в репозиторий:

1. В настройках проекта Jenkins включите "Build Triggers" > "GitHub hook trigger for GITScm polling"
2. В настройках вашего репозитория на GitHub/GitLab добавьте вебхук:
   - URL: `http://ваш_ip_адрес:8080/github-webhook/`
   - События: Push events

## 7. Запуск первой сборки

1. Вернитесь на страницу проекта
2. Нажмите "Build Now" для запуска первой сборки
3. Проверьте логи сборки, чтобы убедиться, что все работает правильно

## Устранение неполадок

### Проблемы с правами доступа к Docker

Если Jenkins не может получить доступ к Docker, выполните:

```bash
# Добавьте пользователя jenkins в группу docker
docker exec -it jenkins bash -c "usermod -aG docker jenkins"

# Перезапустите контейнер
docker restart jenkins
```

### Проблемы с Docker Compose

Убедитесь, что Docker Compose установлен на хосте и доступен в контейнере Jenkins:

```bash
# Установка Docker Compose на хост
curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
``` 