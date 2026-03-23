# Day 21: 第一阶段 - 系统地基期 - Week 3 - 第21天 代码实现（续）

## 应用入口实现

### 1. 主应用入口

```typescript
// src/main.ts
import { SystemIntegrator } from './infrastructure/system/SystemIntegrator';
import { ExpressApp } from './application/ExpressApp';

/**
 * 主应用入口
 */
async function main() {
  const systemIntegrator = new SystemIntegrator();
  
  try {
    // 初始化系统
    const components = await systemIntegrator.initialize();
    
    // 创建并启动Express应用
    const port = components.configManager.get<number>('PORT', 3000);
    const expressApp = new ExpressApp({
      components,
      port,
    });
    
    expressApp.start();
    
    // 处理优雅关闭
    process.on('SIGTERM', async () => {
      components.loggingSystem.logInfo('Received SIGTERM signal, shutting down...');
      await systemIntegrator.shutdown();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      components.loggingSystem.logInfo('Received SIGINT signal, shutting down...');
      await systemIntegrator.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start application:', error);
    await systemIntegrator.shutdown();
    process.exit(1);
  }
}

// 启动应用
main();
```

## 部署配置

### 1. PM2部署配置

**pm2.config.js**
```javascript
module.exports = {
  apps: [
    {
      name: 'ai-cognitive-assistant',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      restart_delay: 3000,
    },
  ],
};
```

**package.json脚本**
```json
{
  "scripts": {
    "start": "node dist/main.js",
    "dev": "ts-node src/main.ts",
    "build": "tsc",
    "pm2:start": "pm2 start pm2.config.js",
    "pm2:start:prod": "pm2 start pm2.config.js --env production",
    "pm2:stop": "pm2 stop ai-cognitive-assistant",
    "pm2:restart": "pm2 restart ai-cognitive-assistant",
    "pm2:logs": "pm2 logs ai-cognitive-assistant",
    "pm2:monit": "pm2 monit ai-cognitive-assistant"
  }
}
```

### 2. Docker部署配置

**Dockerfile**
```dockerfile
# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 创建数据目录
RUN mkdir -p /app/data

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=80

# 暴露端口
EXPOSE 80

# 启动应用
CMD ["node", "dist/main.js"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: ai-cognitive-assistant
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=/app/data/production.db
      - LOG_LEVEL=error
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  
  # 可选：添加Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped
    depends_on:
      - app
  
  # 可选：添加Grafana可视化
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped
    depends_on:
      - prometheus

volumes:
  prometheus_data:
  grafana_data:
```

**prometheus.yml**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

rule_files: []

scrape_configs:
  - job_name: 'ai-cognitive-assistant'
    static_configs:
      - targets: ['app:80']
    metrics_path: /api/metrics/prometheus
```

## 构建和部署脚本

### 1. 构建脚本

**build.sh**
```bash
#!/bin/bash

set -e

echo "=== AI Cognitive Assistant Build Script ==="

# 清理旧构建
echo "Cleaning old build..."
rm -rf dist/

# 安装依赖
echo "Installing dependencies..."
npm ci

# 构建应用
echo "Building application..."
npm run build

# 复制配置文件
echo "Copying configuration files..."
mkdir -p dist/config
cp -r config/* dist/config/

# 复制部署配置
echo "Copying deployment files..."
cp pm2.config.js dist/
cp Dockerfile dist/
cp docker-compose.yml dist/
cp prometheus.yml dist/

echo "=== Build completed successfully! ==="
```

### 2. 部署脚本

**deploy.sh**
```bash
#!/bin/bash

set -e

echo "=== AI Cognitive Assistant Deployment Script ==="

# 检查参数
if [ $# -ne 1 ]; then
    echo "Usage: $0 <environment>"
    echo "Environments: development, production"
    exit 1
fi

ENVIRONMENT=$1

# 验证环境
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Invalid environment: $ENVIRONMENT"
    echo "Environments: development, production"
    exit 1
fi

echo "Deploying to $ENVIRONMENT environment..."

# 构建应用
./build.sh

# 根据环境选择部署方式
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Deploying with Docker..."
    docker-compose up -d --build
else
    echo "Deploying with PM2..."
    pm2 start pm2.config.js --env $ENVIRONMENT
fi

echo "=== Deployment completed successfully! ==="
```

## 稳定版本测试

### 1. 功能测试

```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 运行端到端测试
npm run test:e2e
```

### 2. 性能测试

```bash
# 使用autocannon进行性能测试
npx autocannon -c 100 -d 30 http://localhost:3000/api/health
```

### 3. 安全测试

```bash
# 使用OWASP ZAP进行安全测试
zap-cli quick-scan --self-contained --start-options '-config api.disablekey=true' http://localhost:3000
```
