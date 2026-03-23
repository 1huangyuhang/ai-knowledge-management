# 部署流程文档

索引标签：#部署运维 #部署指南 #Docker #Kubernetes

## 相关文档

- [配置管理](config-management.md) - 系统配置管理设计
- [多环境实现](multi-environment-implementation.md) - 多环境部署实现
- [基础设施层设计](../layered-design/infrastructure-layer-design.md) - 基础设施层设计
- [监控配置](monitoring-configuration.md) - 监控系统配置
- [安全策略](../core-features/security-strategy.md) - 系统安全策略

## 1. 文档概述

本文档详细描述了认知辅助系统的部署流程，涵盖本地开发环境、Docker部署和Kubernetes部署等多种场景。通过遵循本文档的步骤，开发人员和运维人员可以在不同环境下顺利部署和运行系统。

## 2. 部署环境准备

### 2.1 硬件要求

| 环境类型 | CPU | 内存 | 存储 | 网络 |
|----------|-----|------|------|------|
| 开发环境 | 2核 | 4GB | 50GB | 100Mbps |
| 测试环境 | 4核 | 8GB | 100GB | 1Gbps |
| 生产环境 | 8核 | 16GB+ | 200GB+ | 1Gbps+ |

### 2.2 软件要求

| 软件 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥18.0.0 | 运行时环境 |
| npm/yarn | ≥8.0.0 | 包管理工具 |
| Docker | ≥20.10.0 | 容器化部署 |
| Docker Compose | ≥2.0.0 | 多容器管理 |
| Kubernetes | ≥1.21.0 | 容器编排（生产环境） |
| Git | ≥2.30.0 | 版本控制 |

### 2.3 系统依赖

- **开发环境**：
  - macOS, Linux, or Windows with WSL2
  - Python 3.8+（用于某些工具）
  - Make（可选，用于构建脚本）

- **生产环境**：
  - Linux（推荐Ubuntu 20.04+或CentOS 7+）
  - systemd（服务管理）
  - 防火墙配置（允许必要端口）

## 3. 本地开发环境部署

### 3.1 克隆代码库

```bash
git clone https://github.com/your-organization/cognitive-assistant.git
cd cognitive-assistant/backend
```

### 3.2 安装依赖

```bash
npm install
```

### 3.3 配置环境变量

创建`.env`文件，配置必要的环境变量：

```env
# 服务器配置
PORT=3000
NODE_ENV=development
HOST=0.0.0.0

# 数据库配置
DATABASE_URL=sqlite://./data.db

# Qdrant向量数据库配置
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 日志配置
LOG_LEVEL=info

# CORS配置
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3.4 初始化数据库

```bash
npm run db:migrate
npm run db:seed
```

### 3.5 启动开发服务器

```bash
npm run dev
```

开发服务器将在`http://localhost:3000`启动，API文档可通过`http://localhost:3000/docs`访问。

### 3.6 运行测试

```bash
# 运行单元测试
npm run test

# 运行集成测试
npm run test:integration

# 运行所有测试
npm run test:all
```

## 4. Docker部署

### 4.1 Dockerfile

系统提供了预定义的Dockerfile，用于构建容器镜像：

```dockerfile
# 使用官方Node.js LTS镜像作为基础
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

### 4.2 Docker Compose部署

使用Docker Compose可以同时部署应用和依赖服务（如数据库、Qdrant等）。

#### 4.2.1 创建docker-compose.yml文件

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://user:password@db:5432/cognitive_db
      - QDRANT_URL=http://qdrant:6333
      - JWT_SECRET=your-secret-key
    depends_on:
      - db
      - qdrant
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cognitive_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    restart: unless-stopped

volumes:
  postgres_data:
  qdrant_data:
```

#### 4.2.2 启动服务

```bash
docker-compose up -d
```

#### 4.2.3 验证部署

```bash
# 查看容器状态
docker-compose ps

# 查看应用日志
docker-compose logs -f app

# 访问API文档
curl http://localhost:3000/docs
```

#### 4.2.4 停止服务

```bash
docker-compose down
```

## 5. Kubernetes部署

### 5.1 前提条件

- 已安装Kubernetes集群（≥1.21.0）
- 已安装kubectl命令行工具
- 已配置kubectl连接到Kubernetes集群
- 已安装Helm（可选，用于管理Chart）

### 5.2 部署架构

Kubernetes部署架构包括以下组件：

- **应用部署**：运行认知辅助系统应用
- **PostgreSQL数据库**：使用StatefulSet部署
- **Qdrant向量数据库**：使用StatefulSet部署
- **Ingress控制器**：管理外部访问
- **ConfigMap**：存储配置信息
- **Secret**：存储敏感信息
- **Service**：服务发现和负载均衡

### 5.3 部署步骤

#### 5.3.1 创建命名空间

```bash
kubectl create namespace cognitive-assistant
```

#### 5.3.2 创建Secret

```bash
kubectl create secret generic cognitive-secrets \
  --namespace cognitive-assistant \
  --from-literal=jwt-secret=your-secret-key \
  --from-literal=database-url=postgresql://user:password@postgres:5432/cognitive_db \
  --from-literal=qdrant-api-key=your-qdrant-api-key
```

#### 5.3.3 创建ConfigMap

```bash
kubectl create configmap cognitive-config \
  --namespace cognitive-assistant \
  --from-literal=node-env=production \
  --from-literal=port=3000 \
  --from-literal=log-level=info \
  --from-literal=qdrant-url=http://qdrant:6333
```

#### 5.3.4 部署PostgreSQL

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: cognitive-assistant
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_USER
          value: "user"
        - name: POSTGRES_PASSWORD
          value: "password"
        - name: POSTGRES_DB
          value: "cognitive_db"
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: cognitive-assistant
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

应用配置：
```bash
kubectl apply -f postgres-statefulset.yaml
```

#### 5.3.5 部署Qdrant

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: qdrant
  namespace: cognitive-assistant
spec:
  serviceName: qdrant
  replicas: 1
  selector:
    matchLabels:
      app: qdrant
  template:
    metadata:
      labels:
        app: qdrant
    spec:
      containers:
      - name: qdrant
        image: qdrant/qdrant:latest
        ports:
        - containerPort: 6333
        - containerPort: 6334
        volumeMounts:
        - name: qdrant-data
          mountPath: /qdrant/storage
  volumeClaimTemplates:
  - metadata:
      name: qdrant-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
---
apiVersion: v1
kind: Service
metadata:
  name: qdrant
  namespace: cognitive-assistant
spec:
  selector:
    app: qdrant
  ports:
  - port: 6333
    targetPort: 6333
  - port: 6334
    targetPort: 6334
  clusterIP: None
```

应用配置：
```bash
kubectl apply -f qdrant-statefulset.yaml
```

#### 5.3.6 部署应用

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cognitive-app
  namespace: cognitive-assistant
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cognitive-app
  template:
    metadata:
      labels:
        app: cognitive-app
    spec:
      containers:
      - name: cognitive-app
        image: your-registry/cognitive-assistant:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: cognitive-config
              key: node-env
        - name: PORT
          valueFrom:
            configMapKeyRef:
              name: cognitive-config
              key: port
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: cognitive-secrets
              key: database-url
        - name: QDRANT_URL
          valueFrom:
            configMapKeyRef:
              name: cognitive-config
              key: qdrant-url
        - name: QDRANT_API_KEY
          valueFrom:
            secretKeyRef:
              name: cognitive-secrets
              key: qdrant-api-key
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: cognitive-secrets
              key: jwt-secret
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: cognitive-config
              key: log-level
        resources:
          requests:
            cpu: "200m"
            memory: "512Mi"
          limits:
            cpu: "1"
            memory: "1Gi"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: cognitive-app
  namespace: cognitive-assistant
spec:
  selector:
    app: cognitive-app
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

应用配置：
```bash
kubectl apply -f app-deployment.yaml
```

#### 5.3.7 配置Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cognitive-ingress
  namespace: cognitive-assistant
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.cognitive-assistant.example.com
    secretName: cognitive-tls
  rules:
  - host: api.cognitive-assistant.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cognitive-app
            port:
              number: 80
```

应用配置：
```bash
kubectl apply -f ingress.yaml
```

#### 5.3.8 验证部署

```bash
# 查看所有资源状态
kubectl get all -n cognitive-assistant

# 查看应用日志
kubectl logs -f deployment/cognitive-app -n cognitive-assistant

# 访问API文档
curl https://api.cognitive-assistant.example.com/docs
```

## 6. 环境变量配置

### 6.1 核心环境变量

| 变量名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `NODE_ENV` | string | 否 | `development` | 环境类型：development, test, production |
| `PORT` | number | 否 | `3000` | 应用监听端口 |
| `DATABASE_URL` | string | 是 | - | 数据库连接URL |
| `QDRANT_URL` | string | 是 | - | Qdrant向量数据库URL |
| `QDRANT_API_KEY` | string | 否 | - | Qdrant API密钥 |
| `JWT_SECRET` | string | 是 | - | JWT签名密钥 |
| `JWT_EXPIRES_IN` | string | 否 | `15m` | JWT过期时间 |
| `JWT_REFRESH_EXPIRES_IN` | string | 否 | `7d` | 刷新令牌过期时间 |
| `LOG_LEVEL` | string | 否 | `info` | 日志级别：debug, info, warn, error |
| `CORS_ORIGINS` | string | 否 | `*` | 允许的CORS来源，逗号分隔 |

### 6.2 数据库配置

| 变量名 | 描述 |
|--------|------|
| `DB_HOST` | 数据库主机名 |
| `DB_PORT` | 数据库端口 |
| `DB_USER` | 数据库用户名 |
| `DB_PASSWORD` | 数据库密码 |
| `DB_NAME` | 数据库名称 |
| `DB_SSL` | 是否使用SSL连接 |

### 6.3 AI服务配置

| 变量名 | 描述 |
|--------|------|
| `OPENAI_API_KEY` | OpenAI API密钥 |
| `OPENAI_MODEL` | 默认使用的OpenAI模型 |
| `EMBEDDING_MODEL` | 嵌入模型名称 |
| `AI_TIMEOUT` | AI请求超时时间（毫秒） |

## 7. 部署验证

### 7.1 健康检查

系统提供了健康检查端点，用于验证应用是否正常运行：

```bash
curl http://localhost:3000/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-08T12:00:00Z",
  "version": "1.0.0"
}
```

### 7.2 功能验证

1. **API文档访问**：访问`http://localhost:3000/docs`，验证API文档是否正常显示
2. **创建AI任务**：使用API创建一个AI任务，验证系统是否能够正常处理
3. **文件上传**：上传一个测试文件，验证文件处理功能是否正常
4. **语音转文字**：上传一个语音文件，验证语音处理功能是否正常

## 8. 升级和回滚

### 8.1 升级流程

#### 8.1.1 本地开发环境

```bash
# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 运行数据库迁移
npm run db:migrate

# 重启应用
npm run dev
```

#### 8.1.2 Docker Compose环境

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build

# 重启服务
docker-compose up -d

# 运行数据库迁移
docker-compose exec app npm run db:migrate
```

#### 8.1.3 Kubernetes环境

```bash
# 更新镜像
docker build -t your-registry/cognitive-assistant:v1.1.0 .
docker push your-registry/cognitive-assistant:v1.1.0

# 更新部署
kubectl set image deployment/cognitive-app cognitive-app=your-registry/cognitive-assistant:v1.1.0 -n cognitive-assistant

# 运行数据库迁移
kubectl exec deployment/cognitive-app -n cognitive-assistant -- npm run db:migrate

# 验证升级
kubectl rollout status deployment/cognitive-app -n cognitive-assistant
```

### 8.2 回滚流程

#### 8.2.1 Docker Compose环境

```bash
# 查看历史版本
docker images | grep cognitive-assistant

# 回滚到指定版本
docker-compose stop app
docker-compose rm app
docker-compose up -d app --no-deps --force-recreate
```

#### 8.2.2 Kubernetes环境

```bash
# 查看部署历史
kubectl rollout history deployment/cognitive-app -n cognitive-assistant

# 回滚到上一个版本
kubectl rollout undo deployment/cognitive-app -n cognitive-assistant

# 回滚到指定版本
kubectl rollout undo deployment/cognitive-app --to-revision=2 -n cognitive-assistant

# 验证回滚
kubectl rollout status deployment/cognitive-app -n cognitive-assistant
```

## 9. 常见问题排查

### 9.1 端口被占用

**问题**：启动应用时提示端口被占用

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程
kill -9 <PID>

# 或修改应用监听端口
export PORT=3001
npm run dev
```

### 9.2 数据库连接失败

**问题**：应用无法连接到数据库

**解决方案**：
1. 检查数据库服务是否正常运行
2. 验证数据库连接URL是否正确
3. 检查数据库用户权限
4. 查看数据库日志获取详细错误信息

### 9.3 Docker构建失败

**问题**：Docker构建过程中失败

**解决方案**：
1. 检查Dockerfile语法是否正确
2. 验证依赖安装命令
3. 查看构建日志获取详细错误信息
4. 尝试使用不同的基础镜像

### 9.4 Kubernetes部署失败

**问题**：Kubernetes部署后应用状态异常

**解决方案**：
1. 查看Pod状态：`kubectl get pods -n cognitive-assistant`
2. 查看Pod日志：`kubectl logs <pod-name> -n cognitive-assistant`
3. 查看事件：`kubectl describe pod <pod-name> -n cognitive-assistant`
4. 验证资源配置：检查CPU、内存限制是否合理

## 10. 监控和维护

### 10.1 日志管理

- **开发环境**：使用控制台输出日志
- **Docker环境**：使用`docker logs`命令查看日志
- **Kubernetes环境**：集成ELK Stack或Loki+Promtail进行日志收集和分析

### 10.2 性能监控

- 集成Prometheus和Grafana进行系统性能监控
- 监控关键指标：CPU使用率、内存使用率、请求响应时间、错误率等
- 配置告警规则，及时发现和处理异常情况

### 10.3 定期维护

| 维护任务 | 频率 | 负责人 |
|----------|------|--------|
| 备份数据库 | 每日 | 运维人员 |
| 更新依赖 | 每周 | 开发人员 |
| 安全扫描 | 每月 | 安全团队 |
| 性能优化 | 每季度 | 开发+运维 |
| 系统审计 | 每半年 | 安全团队 |

## 11. 文档更新记录

| 更新日期 | 更新内容 | 更新人 |
|----------|----------|--------|
| 2024-01-08 | 初始创建 | 系统架构师 |
