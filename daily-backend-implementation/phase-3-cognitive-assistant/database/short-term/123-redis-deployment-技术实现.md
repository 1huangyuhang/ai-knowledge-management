# 123-Redis部署代码实现

## 1. Redis部署概述

本文档描述了认知辅助系统中Redis缓存的部署方案，包括单节点部署、Docker部署和集群部署三种方式。根据系统当前的规模和需求，我们推荐采用Docker部署方式，便于后续扩展和管理。

## 2. Redis版本选型

### 2.1 版本选择

我们选择Redis 7.0作为缓存系统的版本，理由如下：

1. **稳定性**：Redis 7.0是稳定版本，经过了充分的测试和验证
2. **性能**：相比旧版本，Redis 7.0在性能上有显著提升
3. **功能**：支持更多的新功能，如Redis Functions、细粒度权限控制等
4. **社区支持**：拥有活跃的社区和丰富的文档
5. **兼容性**：与现有客户端库兼容良好

### 2.2 下载地址

- 官方网站：https://redis.io/download
- Docker镜像：redis:7.0

## 3. 单节点部署

### 3.1 安装依赖

```bash
# 更新系统包
apt-get update

# 安装必要依赖
apt-get install -y build-essential tcl
```

### 3.2 编译安装Redis

```bash
# 下载Redis源码
wget https://download.redis.io/releases/redis-7.0.12.tar.gz

# 解压源码
.tar xzf redis-7.0.12.tar.gz

# 进入源码目录
cd redis-7.0.12

# 编译
make

# 安装
make install
```

### 3.3 配置Redis

```bash
# 创建Redis配置目录
mkdir -p /etc/redis

# 创建Redis数据目录
mkdir -p /var/lib/redis

# 创建Redis日志目录
mkdir -p /var/log/redis

# 复制配置文件
cp redis.conf /etc/redis/redis.conf

# 修改配置文件
cat > /etc/redis/redis.conf << EOF
# 绑定地址，允许所有IP访问
bind 0.0.0.0

# 监听端口
port 6379

# 守护进程模式
daemonize yes

# 进程ID文件
pidfile /var/run/redis/redis-server.pid

# 日志文件
logfile /var/log/redis/redis-server.log

# 数据目录
dir /var/lib/redis

# 设置密码
requirepass <your_password>

# 最大内存限制
maxmemory 2gb

# 内存淘汰策略
maxmemory-policy allkeys-lru

# 持久化配置
# RDB持久化
save 900 1
save 300 10
save 60 10000

# AOF持久化
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
EOF
```

### 3.4 启动Redis

```bash
# 创建Redis运行目录
mkdir -p /var/run/redis

# 启动Redis服务
redis-server /etc/redis/redis.conf

# 验证Redis是否启动成功
redis-cli -a <your_password> ping
```

### 3.5 设置开机自启

```bash
# 创建systemd服务文件
cat > /etc/systemd/system/redis.service << EOF
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
Type=forking
User=redis
Group=redis
PIDFile=/var/run/redis/redis-server.pid
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli -a <your_password> shutdown
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 创建redis用户和组
useradd -r -s /bin/false redis

# 设置目录权限
chown -R redis:redis /var/lib/redis
chown -R redis:redis /var/log/redis
chown -R redis:redis /var/run/redis
chown -R redis:redis /etc/redis

# 启动Redis服务
systemctl start redis

# 设置开机自启
systemctl enable redis

# 查看服务状态
systemctl status redis
```

## 4. Docker部署

### 4.1 安装Docker

```bash
# 更新系统包
apt-get update

# 安装Docker依赖
apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common

# 添加Docker GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# 添加Docker仓库
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 安装Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# 启动Docker服务
systemctl start docker

# 设置开机自启
systemctl enable docker

# 验证Docker安装
.docker --version
```

### 4.2 安装Docker Compose

```bash
# 下载Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 设置执行权限
chmod +x /usr/local/bin/docker-compose

# 验证Docker Compose安装
docker-compose --version
```

### 4.3 Docker Compose部署Redis

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7.0
    container_name: redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    environment:
      - REDIS_PASSWORD=<your_password>
    networks:
      - app-network
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  redis-data:
    driver: local

networks:
  app-network:
    driver: bridge
```

### 4.4 Redis配置文件

```conf
# redis.conf
# 绑定地址，允许所有IP访问
bind 0.0.0.0

# 监听端口
port 6379

# 守护进程模式，Docker中不需要
# daemonize no

# 进程ID文件，Docker中不需要
# pidfile /var/run/redis/redis-server.pid

# 日志文件，Docker中使用标准输出
# logfile /var/log/redis/redis-server.log

# 数据目录
dir /data

# 设置密码
requirepass <your_password>

# 最大内存限制
maxmemory 2gb

# 内存淘汰策略
maxmemory-policy allkeys-lru

# 持久化配置
# RDB持久化
save 900 1
save 300 10
save 60 10000

# AOF持久化
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
```

### 4.5 启动Redis容器

```bash
# 启动Redis容器
docker-compose up -d

# 验证Redis是否启动成功
docker exec -it redis redis-cli -a <your_password> ping

# 查看容器日志
docker logs redis

# 查看容器状态
docker ps -a
```

## 5. Redis集群部署

### 5.1 集群架构

Redis集群采用主从复制架构，包含3个主节点和3个从节点，共6个节点。每个主节点负责一部分哈希槽，从节点作为主节点的备份，提供高可用性。

### 5.2 集群配置

```yaml
# docker-compose-cluster.yml
version: '3.8'

services:
  # 主节点
  redis-master-1:
    image: redis:7.0
    container_name: redis-master-1
    restart: always
    ports:
      - "6380:6379"
    volumes:
      - redis-master-1-data:/data
      - ./redis-cluster.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    networks:
      - redis-cluster-network

  redis-master-2:
    image: redis:7.0
    container_name: redis-master-2
    restart: always
    ports:
      - "6381:6379"
    volumes:
      - redis-master-2-data:/data
      - ./redis-cluster.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    networks:
      - redis-cluster-network

  redis-master-3:
    image: redis:7.0
    container_name: redis-master-3
    restart: always
    ports:
      - "6382:6379"
    volumes:
      - redis-master-3-data:/data
      - ./redis-cluster.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    networks:
      - redis-cluster-network

  # 从节点
  redis-slave-1:
    image: redis:7.0
    container_name: redis-slave-1
    restart: always
    ports:
      - "6383:6379"
    volumes:
      - redis-slave-1-data:/data
      - ./redis-cluster.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    networks:
      - redis-cluster-network

  redis-slave-2:
    image: redis:7.0
    container_name: redis-slave-2
    restart: always
    ports:
      - "6384:6379"
    volumes:
      - redis-slave-2-data:/data
      - ./redis-cluster.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    networks:
      - redis-cluster-network

  redis-slave-3:
    image: redis:7.0
    container_name: redis-slave-3
    restart: always
    ports:
      - "6385:6379"
    volumes:
      - redis-slave-3-data:/data
      - ./redis-cluster.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    networks:
      - redis-cluster-network

volumes:
  redis-master-1-data:
    driver: local
  redis-master-2-data:
    driver: local
  redis-master-3-data:
    driver: local
  redis-slave-1-data:
    driver: local
  redis-slave-2-data:
    driver: local
  redis-slave-3-data:
    driver: local

networks:
  redis-cluster-network:
    driver: bridge
```

### 5.3 Redis集群配置文件

```conf
# redis-cluster.conf
# 绑定地址，允许所有IP访问
bind 0.0.0.0

# 监听端口
port 6379

# 守护进程模式，Docker中不需要
# daemonize no

# 进程ID文件，Docker中不需要
# pidfile /var/run/redis/redis-server.pid

# 日志文件，Docker中使用标准输出
# logfile /var/log/redis/redis-server.log

# 数据目录
dir /data

# 设置密码
requirepass <your_password>

# 最大内存限制
maxmemory 2gb

# 内存淘汰策略
maxmemory-policy allkeys-lru

# 持久化配置
# RDB持久化
save 900 1
save 300 10
save 60 10000

# AOF持久化
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# 集群配置
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-ip <your_host_ip>
cluster-announce-port 6379
cluster-announce-bus-port 16379
```

### 5.4 启动Redis集群

```bash
# 启动所有Redis节点
docker-compose -f docker-compose-cluster.yml up -d

# 等待节点启动完成
sleep 5

# 创建Redis集群
docker exec -it redis-master-1 redis-cli -a <your_password> --cluster create \
  <your_host_ip>:6380 \
  <your_host_ip>:6381 \
  <your_host_ip>:6382 \
  <your_host_ip>:6383 \
  <your_host_ip>:6384 \
  <your_host_ip>:6385 \
  --cluster-replicas 1

# 验证集群状态
docker exec -it redis-master-1 redis-cli -a <your_password> --cluster check <your_host_ip>:6380

# 查看集群信息
docker exec -it redis-master-1 redis-cli -a <your_password> cluster info
```

## 6. Redis监控配置

### 6.1 安装Redis Exporter

```yaml
# docker-compose-monitor.yml
version: '3.8'

services:
  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: redis-exporter
    restart: always
    ports:
      - "9121:9121"
    environment:
      - REDIS_ADDR=redis://redis:6379
      - REDIS_PASSWORD=<your_password>
    networks:
      - app-network
    depends_on:
      - redis

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - app-network
    depends_on:
      - redis-exporter

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=<admin_user>
      - GF_SECURITY_ADMIN_PASSWORD=<admin_password>
    networks:
      - app-network
    depends_on:
      - prometheus

volumes:
  prometheus-data:
    driver: local
  grafana-data:
    driver: local

networks:
  app-network:
    driver: bridge
```

### 6.2 Prometheus配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 6.3 启动监控服务

```bash
# 启动监控服务
docker-compose -f docker-compose-monitor.yml up -d

# 验证Redis Exporter是否正常运行
curl http://localhost:9121/metrics

# 访问Prometheus http://localhost:9090
# 访问Grafana http://localhost:3000
```

## 7. Redis安全配置

### 7.1 密码设置

```conf
# 设置强密码
requirepass <strong_password>
```

### 7.2 绑定IP

```conf
# 只允许特定IP访问
bind 127.0.0.1 <app_server_ip>
```

### 7.3 禁用危险命令

```conf
# 禁用危险命令
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""
```

### 7.4 使用SSL/TLS

```conf
# SSL/TLS配置
tls-port 6380
tls-cert-file /etc/redis/redis.crt
tls-key-file /etc/redis/redis.key
tls-ca-cert-file /etc/redis/ca.crt
tls-auth-clients yes
tls-replication yes
tls-cluster yes
```

## 8. Redis性能优化

### 8.1 内存优化

```conf
# 最大内存限制
maxmemory 2gb

# 内存淘汰策略
maxmemory-policy allkeys-lru

# 启用内存压缩（Redis 6.2+）
# activedefrag yes
```

### 8.2 网络优化

```conf
# 最大连接数
maxclients 10000

# TCP keepalive
tcp-keepalive 300

# TCP backlog
tcp-backlog 511
```

### 8.3 持久化优化

```conf
# RDB持久化，减少保存频率
save 3600 1
save 7200 10
save 14400 100

# AOF持久化，使用everysec模式
appendfsync everysec

# AOF重写配置
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

## 9. 部署验证

### 9.1 基本功能验证

```bash
# 连接Redis
redis-cli -a <your_password>

# 测试基本命令
SET test_key "test_value"
GET test_key
DEL test_key
PING
INFO
```

### 9.2 性能测试

```bash
# 使用redis-benchmark进行性能测试
redis-benchmark -a <your_password> -t set,get -n 100000 -q
```

### 9.3 监控验证

1. 访问Prometheus：http://localhost:9090
2. 访问Grafana：http://localhost:3000
3. 导入Redis监控面板（ID：11835）
4. 查看Redis监控指标

## 10. 常见问题排查

### 10.1 Redis无法启动

1. 检查配置文件是否正确
2. 检查端口是否被占用
3. 检查数据目录权限
4. 查看日志文件

### 10.2 连接超时

1. 检查Redis是否运行
2. 检查网络连接
3. 检查防火墙规则
4. 检查绑定地址配置

### 10.3 内存不足

1. 增加Redis内存限制
2. 优化内存淘汰策略
3. 清理无用数据
4. 考虑使用集群

### 10.4 持久化失败

1. 检查数据目录权限
2. 检查磁盘空间
3. 检查持久化配置
4. 查看日志文件

## 11. 总结

本文档提供了Redis缓存的三种部署方式：单节点部署、Docker部署和集群部署。根据系统当前的规模和需求，我们推荐采用Docker部署方式，便于后续扩展和管理。

Redis部署完成后，需要进行基本功能验证、性能测试和监控验证，确保Redis能够正常运行并满足系统的性能需求。同时，还需要进行安全配置和性能优化，提高Redis的安全性和性能。

通过本文档的部署方案，可以快速搭建一个稳定、高效、安全的Redis缓存系统，为认知辅助系统提供可靠的缓存支持。