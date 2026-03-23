# 152-分布式部署代码实现

## 1. 概述

本文档详细描述了分布式部署支持的实现方案，包括Docker Compose配置、服务发现、负载均衡、高可用设计和部署脚本。本方案基于当前项目技术栈，支持PostgreSQL、Redis和ClickHouse的分布式部署，确保系统在大规模环境下的可用性和性能。

## 2. 技术选型

| 组件 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 容器编排 | Docker Compose | 3.8+ | 本地开发和测试环境的容器编排 |
| 服务发现 | Consul | 1.15+ | 分布式环境下的服务注册与发现 |
| 负载均衡 | Nginx | 1.24+ | API网关和负载均衡 |
| 高可用 | Keepalived | 2.2+ | 实现Nginx的高可用 |
| 配置管理 | Consul KV | 1.15+ | 分布式配置管理 |

## 3. 分布式部署架构设计

### 3.1 核心架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          客户端层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   客户端1   │  │   客户端2   │  │   客户端N   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          负载均衡层                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Keepalived + Nginx                    │    │
│  │  ┌─────────────┐           ┌─────────────┐             │    │
│  │  │  Nginx节点1  │◄────────►│  Nginx节点2  │             │    │
│  │  └─────────────┘           └─────────────┘             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          应用服务层                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Fastify集群                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │  应用节点1   │  │  应用节点2   │  │  应用节点N   │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          数据服务层                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  PostgreSQL集群  │  │   Redis集群     │  │  ClickHouse集群  │  │
│  │  ┌─────────┐    │  │  ┌─────────┐    │  │  ┌─────────┐    │  │
│  │  │  主节点  │    │  │  │  主节点  │    │  │  │  节点1   │    │  │
│  │  └─────────┘    │  │  └─────────┘    │  │  └─────────┘    │  │
│  │  ┌─────────┐    │  │  ┌─────────┐    │  │  ┌─────────┐    │  │
│  │  │  从节点1  │   │  │  │  从节点1  │   │  │  │  节点2   │    │  │
│  │  └─────────┘    │  │  └─────────┘    │  │  └─────────┘    │  │
│  │  ┌─────────┐    │  │  ┌─────────┐    │  │  ┌─────────┐    │  │
│  │  │  从节点2  │   │  │  │  从节点2  │   │  │  │  节点3   │    │  │
│  │  └─────────┘    │  │  └─────────┘    │  │  └─────────┘    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          服务管理层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Consul    │  │  Prometheus  │  │   Grafana   │              │
│  │  服务发现   │  │   监控系统   │  │   可视化    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## 4. 核心组件实现

### 4.1 Docker Compose配置

#### 4.1.1 开发环境配置 (`docker-compose.dev.yml`)

```yaml
version: '3.8'

services:
  # 应用服务
  app:
    build: ../../backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://admin:password@postgres:5432/cognitive_assistant
      - REDIS_URL=redis://redis:6379
      - CLICKHOUSE_URL=http://clickhouse:8123
      - CONSUL_URL=http://consul:8500
    depends_on:
      - postgres
      - redis
      - clickhouse
      - consul

  # PostgreSQL主节点
  postgres:
    image: postgres:14
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cognitive_assistant
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis主节点
  redis:
    image: redis:7.0
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # ClickHouse单节点
  clickhouse:
    image: yandex/clickhouse-server:23.3
    restart: always
    ports:
      - "8123:8123"
      - "9000:9000"
    volumes:
      - clickhouse_data:/var/lib/clickhouse
      - ./scripts/clickhouse/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Consul服务发现
  consul:
    image: consul:1.15
    restart: always
    ports:
      - "8500:8500"
      - "8600:8600/udp"
    volumes:
      - consul_data:/consul/data
    command: agent -server -bootstrap-expect=1 -ui -client=0.0.0.0

  # Prometheus监控
  prometheus:
    image: prom/prometheus:v2.45
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    depends_on:
      - consul

  # Grafana可视化
  grafana:
    image: grafana/grafana:10.1
    restart: always
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - prometheus

volumes:
  postgres_data:
  redis_data:
  clickhouse_data:
  consul_data:
  prometheus_data:
  grafana_data:
```

#### 4.1.2 生产环境配置 (`docker-compose.prod.yml`)

```yaml
version: '3.8'

services:
  # Nginx负载均衡
  nginx:
    image: nginx:1.24
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app1
      - app2

  # 应用服务节点1
  app1:
    build: ../../backend
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://admin:password@postgres-master:5432/cognitive_assistant
      - REDIS_URL=redis://redis-master:6379
      - CLICKHOUSE_URL=http://clickhouse-1:8123
      - CONSUL_URL=http://consul-1:8500
    depends_on:
      - postgres-master
      - redis-master
      - consul-1

  # 应用服务节点2
  app2:
    build: ../../backend
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://admin:password@postgres-master:5432/cognitive_assistant
      - REDIS_URL=redis://redis-master:6379
      - CLICKHOUSE_URL=http://clickhouse-1:8123
      - CONSUL_URL=http://consul-1:8500
    depends_on:
      - postgres-master
      - redis-master
      - consul-1

  # PostgreSQL主节点
  postgres-master:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cognitive_assistant
      - POSTGRES_REPLICATION_ROLE=master
      - POSTGRES_REPLICATION_USER=replica
      - POSTGRES_REPLICATION_PASSWORD=replica_password
    volumes:
      - postgres_master_data:/var/lib/postgresql/data
      - ./scripts/postgres/master_init.sql:/docker-entrypoint-initdb.d/init.sql

  # PostgreSQL从节点1
  postgres-slave1:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cognitive_assistant
      - POSTGRES_REPLICATION_ROLE=slave
      - POSTGRES_MASTER_HOST=postgres-master
      - POSTGRES_REPLICATION_USER=replica
      - POSTGRES_REPLICATION_PASSWORD=replica_password
    volumes:
      - postgres_slave1_data:/var/lib/postgresql/data
    depends_on:
      - postgres-master

  # PostgreSQL从节点2
  postgres-slave2:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cognitive_assistant
      - POSTGRES_REPLICATION_ROLE=slave
      - POSTGRES_MASTER_HOST=postgres-master
      - POSTGRES_REPLICATION_USER=replica
      - POSTGRES_REPLICATION_PASSWORD=replica_password
    volumes:
      - postgres_slave2_data:/var/lib/postgresql/data
    depends_on:
      - postgres-master

  # Redis主节点
  redis-master:
    image: redis:7.0
    restart: always
    command: redis-server --appendonly yes --requirepass password --masterauth password

  # Redis从节点1
  redis-slave1:
    image: redis:7.0
    restart: always
    command: redis-server --appendonly yes --requirepass password --masterauth password --slaveof redis-master 6379
    depends_on:
      - redis-master

  # Redis从节点2
  redis-slave2:
    image: redis:7.0
    restart: always
    command: redis-server --appendonly yes --requirepass password --masterauth password --slaveof redis-master 6379
    depends_on:
      - redis-master

  # ClickHouse节点1
  clickhouse-1:
    image: yandex/clickhouse-server:23.3
    restart: always
    volumes:
      - clickhouse_1_data:/var/lib/clickhouse
      - ./scripts/clickhouse/cluster_init.sql:/docker-entrypoint-initdb.d/init.sql

  # ClickHouse节点2
  clickhouse-2:
    image: yandex/clickhouse-server:23.3
    restart: always
    volumes:
      - clickhouse_2_data:/var/lib/clickhouse
    depends_on:
      - clickhouse-1

  # ClickHouse节点3
  clickhouse-3:
    image: yandex/clickhouse-server:23.3
    restart: always
    volumes:
      - clickhouse_3_data:/var/lib/clickhouse
    depends_on:
      - clickhouse-1

  # Consul服务器1
  consul-1:
    image: consul:1.15
    restart: always
    command: agent -server -bootstrap-expect=3 -ui -client=0.0.0.0 -bind=0.0.0.0
    volumes:
      - consul_1_data:/consul/data

  # Consul服务器2
  consul-2:
    image: consul:1.15
    restart: always
    command: agent -server -ui -client=0.0.0.0 -bind=0.0.0.0 -join=consul-1
    volumes:
      - consul_2_data:/consul/data
    depends_on:
      - consul-1

  # Consul服务器3
  consul-3:
    image: consul:1.15
    restart: always
    command: agent -server -ui -client=0.0.0.0 -bind=0.0.0.0 -join=consul-1
    volumes:
      - consul_3_data:/consul/data
    depends_on:
      - consul-1

volumes:
  postgres_master_data:
  postgres_slave1_data:
  postgres_slave2_data:
  redis_master_data:
  redis_slave1_data:
  redis_slave2_data:
  clickhouse_1_data:
  clickhouse_2_data:
  clickhouse_3_data:
  consul_1_data:
  consul_2_data:
  consul_3_data:
```

### 4.2 服务发现实现

#### 4.2.1 Consul客户端集成

```typescript
// src/infrastructure/service-discovery/ConsulServiceDiscovery.ts
import { singleton } from 'tsyringe';
import consul, { Consul } from 'consul';
import { ServiceDiscovery } from './ServiceDiscovery';
import { Logger } from '../logging/Logger';

@singleton()
export class ConsulServiceDiscovery implements ServiceDiscovery {
  private consulClient: Consul;

  constructor(private logger: Logger) {
    this.consulClient = consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: parseInt(process.env.CONSUL_PORT || '8500'),
    });
  }

  /**
   * 注册服务
   */
  async registerService(
    serviceName: string,
    serviceId: string,
    address: string,
    port: number,
    tags: string[] = [],
    check: any = null
  ): Promise<void> {
    try {
      await this.consulClient.agent.service.register({
        name: serviceName,
        id: serviceId,
        address,
        port,
        tags,
        check: check || {
          http: `http://${address}:${port}/health`,
          interval: '10s',
          timeout: '5s',
        },
      });
      this.logger.info(`Service ${serviceName} registered with Consul`);
    } catch (error) {
      this.logger.error(`Failed to register service ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * 注销服务
   */
  async deregisterService(serviceId: string): Promise<void> {
    try {
      await this.consulClient.agent.service.deregister(serviceId);
      this.logger.info(`Service ${serviceId} deregistered from Consul`);
    } catch (error) {
      this.logger.error(`Failed to deregister service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * 发现服务
   */
  async discoverService(serviceName: string): Promise<any[]> {
    try {
      const services = await this.consulClient.health.service(serviceName, {
        passing: true,
      });
      return services.map(({ Service }) => Service);
    } catch (error) {
      this.logger.error(`Failed to discover service ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * 获取服务实例
   */
  async getServiceInstance(serviceName: string): Promise<any> {
    const services = await this.discoverService(serviceName);
    if (services.length === 0) {
      throw new Error(`No healthy instances found for service ${serviceName}`);
    }
    // 简单的轮询负载均衡
    const index = Math.floor(Math.random() * services.length);
    return services[index];
  }
}
```

#### 4.2.2 服务发现接口定义

```typescript
// src/infrastructure/service-discovery/ServiceDiscovery.ts
export interface ServiceDiscovery {
  /**
   * 注册服务
   */
  registerService(
    serviceName: string,
    serviceId: string,
    address: string,
    port: number,
    tags?: string[],
    check?: any
  ): Promise<void>;

  /**
   * 注销服务
   */
  deregisterService(serviceId: string): Promise<void>;

  /**
   * 发现服务
   */
  discoverService(serviceName: string): Promise<any[]>;

  /**
   * 获取服务实例
   */
  getServiceInstance(serviceName: string): Promise<any>;
}
```

### 4.3 负载均衡配置

#### 4.3.1 Nginx配置文件 (`nginx.conf`)

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    #tcp_nopush on;

    keepalive_timeout 65;

    #gzip on;

    # 上游服务器配置
    upstream app_servers {
        server app1:3000 max_fails=3 fail_timeout=30s;
        server app2:3000 max_fails=3 fail_timeout=30s;
        # 可根据需要添加更多服务器
    }

    # API网关配置
    server {
        listen 80;
        server_name localhost;

        # 健康检查端点
        location /health {
            return 200 "OK";
        }

        # 应用服务代理
        location / {
            proxy_pass http://app_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 限流配置
        limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;
        location /api/ {
            limit_req zone=mylimit burst=20 nodelay;
            proxy_pass http://app_servers;
        }
    }
}
```

### 4.4 配置管理实现

#### 4.4.1 Consul KV配置客户端

```typescript
// src/infrastructure/config/ConsulConfigManager.ts
import { singleton } from 'tsyringe';
import consul, { Consul } from 'consul';
import { ConfigManager } from './ConfigManager';
import { Logger } from '../logging/Logger';

@singleton()
export class ConsulConfigManager implements ConfigManager {
  private consulClient: Consul;
  private configCache: Record<string, any> = {};

  constructor(private logger: Logger) {
    this.consulClient = consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: parseInt(process.env.CONSUL_PORT || '8500'),
    });
    this.watchConfigChanges();
  }

  /**
   * 获取配置
   */
  async getConfig<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      if (this.configCache[key]) {
        return this.configCache[key] as T;
      }

      const result = await this.consulClient.kv.get<T>(key);
      if (result && result.Value) {
        const value = typeof result.Value === 'string' 
          ? JSON.parse(result.Value) 
          : result.Value as T;
        this.configCache[key] = value;
        return value;
      }

      if (defaultValue !== undefined) {
        return defaultValue;
      }

      throw new Error(`Config key ${key} not found`);
    } catch (error) {
      this.logger.error(`Failed to get config ${key}:`, error);
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * 设置配置
   */
  async setConfig<T>(key: string, value: T): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.consulClient.kv.set(key, stringValue);
      this.configCache[key] = value;
      this.logger.info(`Config ${key} updated`);
    } catch (error) {
      this.logger.error(`Failed to set config ${key}:`, error);
      throw error;
    }
  }

  /**
   * 监听配置变化
   */
  private async watchConfigChanges(): Promise<void> {
    try {
      const watcher = this.consulClient.watch({
        method: this.consulClient.kv.get,
        options: {
          key: 'cognitive-assistant/',
          recurse: true,
        },
      });

      watcher.on('change', (data) => {
        if (data && data.Value) {
          const value = typeof data.Value === 'string' 
            ? JSON.parse(data.Value) 
            : data.Value;
          this.configCache[data.Key] = value;
          this.logger.info(`Config ${data.Key} changed, updated cache`);
        }
      });

      watcher.on('error', (error) => {
        this.logger.error('Config watcher error:', error);
      });
    } catch (error) {
      this.logger.error('Failed to start config watcher:', error);
    }
  }
}
```

#### 4.4.2 配置管理接口定义

```typescript
// src/infrastructure/config/ConfigManager.ts
export interface ConfigManager {
  /**
   * 获取配置
   */
  getConfig<T>(key: string, defaultValue?: T): Promise<T>;

  /**
   * 设置配置
   */
  setConfig<T>(key: string, value: T): Promise<void>;
}
```

## 5. 部署脚本

### 5.1 本地开发环境部署脚本 (`deploy-dev.sh`)

```bash
#!/bin/bash

echo "=== 部署开发环境 ==="

# 检查Docker和Docker Compose是否安装
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

# 构建应用镜像
echo "=== 构建应用镜像 ==="
docker-compose -f docker-compose.dev.yml build

# 启动服务
echo "=== 启动服务 ==="
docker-compose -f docker-compose.dev.yml up -d

# 等待服务启动
echo "=== 等待服务启动 ==="
sleep 10

# 检查服务状态
echo "=== 检查服务状态 ==="
docker-compose -f docker-compose.dev.yml ps

echo "=== 开发环境部署完成 ==="
echo "应用访问地址: http://localhost:3000"
echo "Consul控制台: http://localhost:8500"
echo "Grafana控制台: http://localhost:3001 (用户名: admin, 密码: admin)"
echo "Prometheus控制台: http://localhost:9090"
```

### 5.2 生产环境部署脚本 (`deploy-prod.sh`)

```bash
#!/bin/bash

echo "=== 部署生产环境 ==="

# 检查Docker和Docker Compose是否安装
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

# 构建应用镜像
echo "=== 构建应用镜像 ==="
docker-compose -f docker-compose.prod.yml build

# 启动服务
echo "=== 启动服务 ==="
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "=== 等待服务启动 ==="
sleep 20

# 检查服务状态
echo "=== 检查服务状态 ==="
docker-compose -f docker-compose.prod.yml ps

# 初始化数据库
echo "=== 初始化数据库 ==="
docker-compose -f docker-compose.prod.yml exec postgres-master psql -U admin -d cognitive_assistant -f /docker-entrypoint-initdb.d/init.sql

# 初始化ClickHouse
echo "=== 初始化ClickHouse ==="
docker-compose -f docker-compose.prod.yml exec clickhouse-1 clickhouse-client --query "CREATE DATABASE IF NOT EXISTS cognitive_analytics;"

# 运行数据同步
echo "=== 运行数据同步 ==="
docker-compose -f docker-compose.prod.yml exec app1 npm run sync:data

echo "=== 生产环境部署完成 ==="
echo "应用访问地址: http://localhost"
echo "Consul控制台: http://localhost:8500"
```

### 5.3 服务扩展脚本 (`scale-service.sh`)

```bash
#!/bin/bash

# 检查参数
if [ $# -ne 2 ]; then
    echo "Usage: $0 <service-name> <scale-count>"
    echo "Example: $0 app 3"
    exit 1
fi

SERVICE_NAME=$1
SCALE_COUNT=$2

echo "=== 扩展服务 $SERVICE_NAME 到 $SCALE_COUNT 个实例 ==="

docker-compose -f docker-compose.prod.yml up -d --scale $SERVICE_NAME=$SCALE_COUNT

echo "=== 服务扩展完成 ==="
docker-compose -f docker-compose.prod.yml ps $SERVICE_NAME
```

## 6. 高可用设计

### 6.1 PostgreSQL高可用配置

#### 6.1.1 PostgreSQL主从复制配置

```sql
-- 主节点初始化脚本 (master_init.sql)
-- 创建复制用户
CREATE USER replica WITH REPLICATION ENCRYPTED PASSWORD 'replica_password';

-- 配置主节点
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET wal_keep_size = '1GB';
ALTER SYSTEM SET hot_standby = on;

-- 重新加载配置
SELECT pg_reload_conf();

-- 创建复制槽
SELECT * FROM pg_create_physical_replication_slot('replica_slot');
```

#### 6.1.2 从节点初始化脚本

```bash
#!/bin/bash
# 从节点初始化脚本 (slave_init.sh)

# 停止PostgreSQL服务
pg_ctl stop -D /var/lib/postgresql/data

# 清空数据目录
rm -rf /var/lib/postgresql/data/*

# 从主节点复制数据
PGPASSWORD=replica_password pg_basebackup -h $POSTGRES_MASTER_HOST -U replica -D /var/lib/postgresql/data -Fp -Xs -P -R

# 启动PostgreSQL服务
pg_ctl start -D /var/lib/postgresql/data
```

### 6.2 Redis高可用配置

#### 6.2.1 Redis哨兵配置

```yaml
# redis-sentinel.conf
dir /tmp
sentinel monitor mymaster redis-master 6379 2
sentinel auth-pass mymaster password
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
```

## 7. 监控和维护

### 7.1 分布式监控配置

#### 7.1.1 Prometheus配置文件 (`prometheus.yml`)

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
  # - "second_rules.yml"

scrape_configs:
  # 监控Prometheus自身
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # 监控Consul服务
  - job_name: 'consul'
    consul_sd_configs:
      - server: 'consul:8500'
        services: []
    relabel_configs:
      - source_labels: [__meta_consul_service]          
        target_label: job
      - source_labels: [__meta_consul_service_id]       
        target_label: instance

  # 监控PostgreSQL
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # 监控Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # 监控应用服务
  - job_name: 'app'
    static_configs:
      - targets: ['app1:3000', 'app2:3000']
    metrics_path: '/metrics'
```

### 7.2 健康检查实现

```typescript
// src/presentation/health/HealthController.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { injectable } from 'tsyringe';
import { HealthCheckService } from '../../application/health/HealthCheckService';

@injectable()
export class HealthController {
  constructor(private healthCheckService: HealthCheckService) {}

  /**
   * 注册健康检查路由
   */
  registerRoutes(fastify: FastifyInstance): void {
    fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
      const healthStatus = await this.healthCheckService.checkHealth();
      reply.status(healthStatus.status === 'ok' ? 200 : 503).send(healthStatus);
    });

    fastify.get('/health/detailed', async (request: FastifyRequest, reply: FastifyReply) => {
      const detailedStatus = await this.healthCheckService.checkDetailedHealth();
      reply.status(detailedStatus.status === 'ok' ? 200 : 503).send(detailedStatus);
    });
  }
}
```

```typescript
// src/application/health/HealthCheckService.ts
import { injectable } from 'tsyringe';
import { PostgreSQLConnectionManager } from '../../infrastructure/persistence/postgresql/PostgreSQLConnectionManager';
import { RedisConnectionManager } from '../../infrastructure/persistence/redis/RedisConnectionManager';
import { ClickHouseConnectionManager } from '../../infrastructure/persistence/clickhouse/ClickHouseConnectionManager';

@injectable()
export class HealthCheckService {
  constructor(
    private postgresConnectionManager: PostgreSQLConnectionManager,
    private redisConnectionManager: RedisConnectionManager,
    private clickhouseConnectionManager: ClickHouseConnectionManager
  ) {}

  /**
   * 检查系统健康状态
   */
  async checkHealth(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      // 检查PostgreSQL连接
      await this.postgresConnectionManager.testConnection();
      
      // 检查Redis连接
      await this.redisConnectionManager.testConnection();
      
      // 检查ClickHouse连接
      await this.clickhouseConnectionManager.testConnection();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 检查详细健康状态
   */
  async checkDetailedHealth(): Promise<{
    status: 'ok' | 'error';
    timestamp: string;
    services: Record<string, { status: 'ok' | 'error'; message?: string }>;
  }> {
    const services: Record<string, { status: 'ok' | 'error'; message?: string }> = {};
    let overallStatus: 'ok' | 'error' = 'ok';

    // 检查PostgreSQL
    try {
      await this.postgresConnectionManager.testConnection();
      services.postgres = { status: 'ok' };
    } catch (error: any) {
      services.postgres = { status: 'error', message: error.message };
      overallStatus = 'error';
    }

    // 检查Redis
    try {
      await this.redisConnectionManager.testConnection();
      services.redis = { status: 'ok' };
    } catch (error: any) {
      services.redis = { status: 'error', message: error.message };
      overallStatus = 'error';
    }

    // 检查ClickHouse
    try {
      await this.clickhouseConnectionManager.testConnection();
      services.clickhouse = { status: 'ok' };
    } catch (error: any) {
      services.clickhouse = { status: 'error', message: error.message };
      overallStatus = 'error';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
    };
  }
}
```

## 8. 安全配置

### 8.1 网络安全

- 使用Docker网络隔离不同服务
- 配置防火墙规则，只允许必要端口访问
- 使用TLS加密所有服务间通信
- 配置Nginx HTTPS

### 8.2 认证和授权

- 为所有服务配置强密码
- 使用Consul ACL进行服务访问控制
- 配置PostgreSQL和Redis的访问控制列表
- 实现API网关的认证和授权

### 8.3 TLS配置

```nginx
# Nginx HTTPS配置
server {
    listen 443 ssl;
    server_name localhost;

    ssl_certificate /etc/nginx/certs/server.crt;
    ssl_certificate_key /etc/nginx/certs/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # 应用服务代理
    location / {
        proxy_pass http://app_servers;
        # 其他代理配置...
    }
}
```

## 9. 总结

本文档提供了完整的分布式部署支持实现方案，包括：

1. Docker Compose配置，支持开发和生产环境
2. 服务发现机制，基于Consul实现
3. 负载均衡配置，使用Nginx
4. 高可用设计，包括PostgreSQL主从复制和Redis主从复制
5. 部署脚本，支持自动化部署和服务扩展
6. 监控和健康检查实现
7. 安全配置，包括网络隔离、认证授权和TLS加密

本方案基于当前项目技术栈，确保系统在分布式环境下的可用性、性能和安全性。通过实施本方案，可以支持系统的大规模部署和扩展，满足未来业务增长的需求。
