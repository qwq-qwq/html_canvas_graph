#!/bin/bash

# Скрипт для базовой инициализации нового сервера Digital Ocean
# Запускать на целевом сервере от имени root

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

echo -e "${YELLOW}Инициализация нового сервера Digital Ocean...${NC}"

# Обновление системы
echo -e "${YELLOW}Обновление системы...${NC}"
apt-get update
apt-get upgrade -y

# Установка базовых пакетов
echo -e "${YELLOW}Установка базовых пакетов...${NC}"
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    ufw \
    git \
    htop \
    vim \
    fail2ban

# Настройка firewall
echo -e "${YELLOW}Настройка firewall...${NC}"
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 8080/tcp # для Jenkins (опционально)
echo -e "${YELLOW}Включение firewall...${NC}"
echo "y" | ufw enable

# Установка и настройка fail2ban для защиты SSH
echo -e "${YELLOW}Настройка fail2ban для защиты SSH...${NC}"
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
findtime = 600
bantime = 3600
EOF
systemctl restart fail2ban

# Создание пользователя с sudo правами (опционально)
echo -e "${YELLOW}Хотите создать нового пользователя с sudo правами? (y/n)${NC}"
read -r create_user
if [[ "$create_user" == "y" ]]; then
    echo -e "${YELLOW}Введите имя пользователя:${NC}"
    read -r username
    adduser "$username"
    usermod -aG sudo "$username"
    
    # Настройка SSH для нового пользователя
    mkdir -p /home/"$username"/.ssh
    chmod 700 /home/"$username"/.ssh
    
    echo -e "${YELLOW}Хотите добавить SSH ключ для пользователя? (y/n)${NC}"
    read -r add_ssh_key
    if [[ "$add_ssh_key" == "y" ]]; then
        echo -e "${YELLOW}Вставьте публичный SSH ключ:${NC}"
        read -r ssh_key
        echo "$ssh_key" > /home/"$username"/.ssh/authorized_keys
        chmod 600 /home/"$username"/.ssh/authorized_keys
        chown -R "$username":"$username" /home/"$username"/.ssh
    fi
    
    echo -e "${GREEN}Пользователь $username создан и добавлен в группу sudo${NC}"
fi

# Настройка временной зоны
echo -e "${YELLOW}Настройка временной зоны...${NC}"
timedatectl set-timezone Europe/Kiev  # Измените на вашу временную зону

# Настройка swap (опционально для малых инстансов)
echo -e "${YELLOW}Настройка swap-файла...${NC}"
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# Оптимизация системных параметров
echo -e "${YELLOW}Оптимизация системных параметров...${NC}"
cat >> /etc/sysctl.conf << 'EOF'
# Увеличение лимитов для сетевых соединений
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# Оптимизация TCP
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_fastopen = 3
net.ipv4.tcp_tw_reuse = 1

# Увеличение диапазона портов
net.ipv4.ip_local_port_range = 1024 65535

# Оптимизация файловой системы
fs.file-max = 2097152
EOF
sysctl -p

# Оптимизация лимитов ресурсов
cat > /etc/security/limits.conf << 'EOF'
* soft nofile 1048576
* hard nofile 1048576
root soft nofile 1048576
root hard nofile 1048576
* soft nproc 262144
* hard nproc 262144
root soft nproc 262144
root hard nproc 262144
EOF

# Проверка статуса служб
echo -e "${YELLOW}Проверка статуса служб...${NC}"
systemctl status fail2ban
systemctl status ufw

echo -e "${GREEN}Инициализация сервера завершена!${NC}"
echo -e "${YELLOW}Рекомендуется перезагрузить сервер для применения всех изменений.${NC}"
echo -e "${YELLOW}Хотите перезагрузить сервер сейчас? (y/n)${NC}"
read -r reboot_now
if [[ "$reboot_now" == "y" ]]; then
    echo -e "${YELLOW}Сервер будет перезагружен через 5 секунд...${NC}"
    sleep 5
    reboot
fi 