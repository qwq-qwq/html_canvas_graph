# Настройка Jenkins для работы в подпапке

После установки Jenkins его нужно настроить для работы в подпапке `/jenkins`. Это позволит Nginx проксировать запросы к Jenkins через путь `/jenkins`, а основной путь `/` оставить для нашего приложения HTML Canvas Graph.

## Шаги по настройке

1. Получите доступ к контейнеру Jenkins:

```bash
docker exec -it jenkins bash
```

2. Создайте или отредактируйте файл `/var/jenkins_home/jenkins.model.JenkinsLocationConfiguration.xml`:

```bash
vi /var/jenkins_home/jenkins.model.JenkinsLocationConfiguration.xml
```

Содержимое файла должно быть следующим:

```xml
<?xml version='1.1' encoding='UTF-8'?>
<jenkins.model.JenkinsLocationConfiguration>
  <adminAddress>адрес@почты.администратора</adminAddress>
  <jenkinsUrl>http://ваш_ip_адрес/jenkins/</jenkinsUrl>
</jenkins.model.JenkinsLocationConfiguration>
```

3. Отредактируйте файл настроек Jenkins `/var/jenkins_home/config.xml`:

```bash
vi /var/jenkins_home/config.xml
```

Найдите элемент `<useSecurity>true</useSecurity>` и добавьте после него:

```xml
<jenkinsUrl>http://ваш_ip_адрес/jenkins/</jenkinsUrl>
<rootUrl>http://ваш_ip_адрес/jenkins/</rootUrl>
```

4. Создайте файл настроек для работы в подпапке (если он еще не существует):

```bash
vi /usr/share/jenkins/ref/init.groovy.d/set-prefix.groovy
mkdir -p /var/jenkins_home/init.groovy.d/
vi /var/jenkins_home/init.groovy.d/set-prefix.groovy
```

Содержимое файла:

```groovy
import jenkins.model.Jenkins

def jenkins = Jenkins.instance
jenkins.setRootUrl("http://ваш_ip_адрес/jenkins/")
jenkins.save()
```

5. Перезапустите контейнер Jenkins:

```bash
exit
docker restart jenkins
```

## Настройка для поддержки вебхуков

Если вы планируете использовать вебхуки от GitHub/GitLab, убедитесь, что URL вебхука указывает на правильный путь:

```
http://ваш_ip_адрес/jenkins/github-webhook/
```

## Проверка настройки

После перезапуска Jenkins должен быть доступен по адресу:

```
http://ваш_ip_адрес/jenkins/
```

И ваше приложение HTML Canvas Graph должно быть доступно по адресу:

```
http://ваш_ip_адрес/
``` 