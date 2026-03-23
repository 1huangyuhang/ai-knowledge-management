# 114-自动化备份部署代码

## 1. 自动化备份概述

自动化备份是指通过脚本或工具自动执行数据库备份任务，无需人工干预。自动化备份可以提高备份的可靠性和一致性，减少人为错误，确保备份任务按时执行。

## 2. 自动化备份架构

### 2.1 架构设计

设计三层自动化备份架构：

1. **调度层**：负责调度备份任务，支持多种调度方式，如cron、systemd定时器等
2. **执行层**：负责执行备份任务，调用备份工具，如pgBackRest
3. **监控层**：负责监控备份任务的执行情况，发送告警通知

### 2.2 组件关系

```
+----------------+     +----------------+     +----------------+
|   调度层       |     |   执行层       |     |   监控层       |
|  (cron/systemd)|---->|  (pgBackRest)  |---->| (Prometheus/   |
|                |     |                |     |  Alertmanager) |
+----------------+     +----------------+     +----------------+
```

## 3. 自动化备份工具选型

### 3.1 调度工具比较

| 工具名称 | 类型 | 特点 | 适用场景 |
|----------|------|------|----------|
| **cron** | 系统工具 | 简单易用，支持定时任务 | 简单的定时备份任务 |
| **systemd定时器** | 系统工具 | 支持复杂的定时规则，支持依赖关系 | 复杂的备份任务，需要精确控制 |
| **Airflow** | 第三方工具 | 支持工作流，可视化界面，支持依赖关系 | 复杂的备份工作流，需要可视化管理 |
| **Jenkins** | 第三方工具 | 支持CI/CD，可视化界面，支持插件 | 需要与其他CI/CD流程集成 |

### 3.2 推荐工具

**推荐工具**：systemd定时器
- 理由：支持复杂的定时规则，可靠性高，与系统集成紧密，无需额外安装软件
- 适用场景：中大型数据库备份任务，需要精确控制和高可靠性

## 4. 自动化备份部署实现

### 4.1 安装和配置pgBackRest

#### 4.1.1 安装pgBackRest

```bash
# Ubuntu/Debian
apt-get update
apt-get install -y pgbackrest

# CentOS/RHEL
yum install -y pgbackrest
```

#### 4.1.2 配置pgBackRest

创建pgBackRest配置文件`/etc/pgbackrest.conf`：

```ini
# 全局配置
global:
  repo1-path: /backup/pgbackrest
  repo1-retention-full: 4
  repo1-retention-diff: 7
  repo1-retention-archive: 14
  repo1-compress-type: lz4
  repo1-compress-level: 6
  log-level-file: info
  log-path: /var/log/pgbackrest

# PostgreSQL实例配置
[postgres]
pg1-path: /var/lib/postgresql/14/main
pg1-port: 5432
pg1-user: postgres
pg1-host: localhost
pg1-host-user: pgbackrest
```

### 4.2 创建备份脚本

#### 4.2.1 全量备份脚本

创建全量备份脚本`/usr/local/bin/pgbackrest-full-backup.sh`：

```bash
#!/bin/bash

# 全量备份脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
BACKUP_TYPE="full"
LOG_FILE="/var/log/pgbackrest/full_backup_$(date +%Y%m%d_%H%M%S).log"

# 执行备份
echo "开始执行全量备份，时间：$(date)" >> $LOG_FILE
echo "备份参数：STANZA=$STANZA, BACKUP_TYPE=$BACKUP_TYPE" >> $LOG_FILE

pgbackrest --stanza=$STANZA backup --type=$BACKUP_TYPE >> $LOG_FILE 2>&1

# 检查备份结果
if [ $? -eq 0 ]; then
    echo "全量备份执行成功，时间：$(date)" >> $LOG_FILE
    
    # 获取备份信息
    echo "备份信息：" >> $LOG_FILE
    pgbackrest --stanza=$STANZA info >> $LOG_FILE 2>&1
    
    # 验证备份
    echo "开始验证备份，时间：$(date)" >> $LOG_FILE
    pgbackrest --stanza=$STANZA check >> $LOG_FILE 2>&1
    
    if [ $? -eq 0 ]; then
        echo "备份验证成功，时间：$(date)" >> $LOG_FILE
        exit 0
    else
        echo "备份验证失败，时间：$(date)" >> $LOG_FILE
        # 发送告警邮件
        echo "全量备份验证失败，请检查备份日志。" | mail -s "[告警] PostgreSQL全量备份验证失败" db-admin@example.com
        exit 1
    fi
else
    echo "全量备份执行失败，时间：$(date)" >> $LOG_FILE
    # 发送告警邮件
    echo "全量备份执行失败，请检查备份日志。" | mail -s "[告警] PostgreSQL全量备份失败" db-admin@example.com
    exit 1
fi
```

#### 4.2.2 增量备份脚本

创建增量备份脚本`/usr/local/bin/pgbackrest-incremental-backup.sh`：

```bash
#!/bin/bash

# 增量备份脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
BACKUP_TYPE="incr"
LOG_FILE="/var/log/pgbackrest/incremental_backup_$(date +%Y%m%d_%H%M%S).log"

# 执行备份
echo "开始执行增量备份，时间：$(date)" >> $LOG_FILE
echo "备份参数：STANZA=$STANZA, BACKUP_TYPE=$BACKUP_TYPE" >> $LOG_FILE

pgbackrest --stanza=$STANZA backup --type=$BACKUP_TYPE >> $LOG_FILE 2>&1

# 检查备份结果
if [ $? -eq 0 ]; then
    echo "增量备份执行成功，时间：$(date)" >> $LOG_FILE
    
    # 获取备份信息
    echo "备份信息：" >> $LOG_FILE
    pgbackrest --stanza=$STANZA info >> $LOG_FILE 2>&1
    
    # 验证备份
    echo "开始验证备份，时间：$(date)" >> $LOG_FILE
    pgbackrest --stanza=$STANZA check >> $LOG_FILE 2>&1
    
    if [ $? -eq 0 ]; then
        echo "备份验证成功，时间：$(date)" >> $LOG_FILE
        exit 0
    else
        echo "备份验证失败，时间：$(date)" >> $LOG_FILE
        # 发送告警邮件
        echo "增量备份验证失败，请检查备份日志。" | mail -s "[告警] PostgreSQL增量备份验证失败" db-admin@example.com
        exit 1
    fi
else
    echo "增量备份执行失败，时间：$(date)" >> $LOG_FILE
    # 发送告警邮件
    echo "增量备份执行失败，请检查备份日志。" | mail -s "[告警] PostgreSQL增量备份失败" db-admin@example.com
    exit 1
fi
```

#### 4.2.3 设置脚本权限

```bash
# 设置脚本执行权限
chmod +x /usr/local/bin/pgbackrest-full-backup.sh
chmod +x /usr/local/bin/pgbackrest-incremental-backup.sh

# 设置脚本所有者
chown pgbackrest:pgbackrest /usr/local/bin/pgbackrest-full-backup.sh
chown pgbackrest:pgbackrest /usr/local/bin/pgbackrest-incremental-backup.sh
```

### 4.3 使用systemd定时器配置自动化备份

#### 4.3.1 配置全量备份systemd服务

创建全量备份服务文件`/etc/systemd/system/pgbackrest-full-backup.service`：

```ini
[Unit]
Description=pgBackRest Full Backup
After=network.target

[Service]
Type=oneshot
User=pgbackrest
Group=pgbackrest
ExecStart=/usr/local/bin/pgbackrest-full-backup.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

创建全量备份定时器文件`/etc/systemd/system/pgbackrest-full-backup.timer`：

```ini
[Unit]
Description=Run pgBackRest Full Backup weekly

[Timer]
# 每周日凌晨2点执行
OnCalendar=Sun *-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

#### 4.3.2 配置增量备份systemd服务

创建增量备份服务文件`/etc/systemd/system/pgbackrest-incremental-backup.service`：

```ini
[Unit]
Description=pgBackRest Incremental Backup
After=network.target

[Service]
Type=oneshot
User=pgbackrest
Group=pgbackrest
ExecStart=/usr/local/bin/pgbackrest-incremental-backup.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

创建增量备份定时器文件`/etc/systemd/system/pgbackrest-incremental-backup.timer`：

```ini
[Unit]
Description=Run pgBackRest Incremental Backup daily

[Timer]
# 每天凌晨1点执行
OnCalendar=*-*-* 01:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

#### 4.3.3 启动和启用定时器

```bash
# 重新加载systemd配置
systemctl daemon-reload

# 启用并启动全量备份定时器
systemctl enable pgbackrest-full-backup.timer
systemctl start pgbackrest-full-backup.timer

# 启用并启动增量备份定时器
systemctl enable pgbackrest-incremental-backup.timer
systemctl start pgbackrest-incremental-backup.timer

# 查看定时器状态
systemctl list-timers --all | grep pgbackrest
```

### 4.4 使用cron配置自动化备份

#### 4.4.1 配置cron定时任务

```bash
# 编辑pgbackrest用户的crontab
crontab -e -u pgbackrest

# 添加以下内容
# 每周日凌晨2点执行全量备份
0 2 * * 0 /usr/local/bin/pgbackrest-full-backup.sh

# 每天凌晨1点执行增量备份
0 1 * * * /usr/local/bin/pgbackrest-incremental-backup.sh
```

#### 4.4.2 验证cron配置

```bash
# 查看pgbackrest用户的crontab
crontab -l -u pgbackrest

# 检查cron服务状态
systemctl status cron
```

## 5. 自动化备份监控

### 5.1 配置Prometheus监控

#### 5.1.1 创建备份状态监控脚本

创建备份状态监控脚本`/usr/local/bin/monitor_backup_status.sh`：

```bash
#!/bin/bash

# 备份状态监控脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
METRICS_FILE="/var/lib/node_exporter/textfile_collector/pgbackrest.prom"

# 创建metrics目录
mkdir -p /var/lib/node_exporter/textfile_collector

# 获取备份信息
BACKUP_INFO=$(pgbackrest --stanza=$STANZA info 2>/dev/null)

# 初始化指标
cat > $METRICS_FILE << EOF
# HELP pgbackrest_backup_status Backup status (0=error, 1=success)
# TYPE pgbackrest_backup_status gauge
pgbackrest_backup_status 0

# HELP pgbackrest_last_full_backup_timestamp Last full backup timestamp
# TYPE pgbackrest_last_full_backup_timestamp gauge
pgbackrest_last_full_backup_timestamp 0

# HELP pgbackrest_last_incremental_backup_timestamp Last incremental backup timestamp
# TYPE pgbackrest_last_incremental_backup_timestamp gauge
pgbackrest_last_incremental_backup_timestamp 0
EOF

# 检查备份信息是否获取成功
if [ $? -eq 0 ]; then
    # 更新备份状态为成功
    sed -i 's/pgbackrest_backup_status 0/pgbackrest_backup_status 1/' $METRICS_FILE
    
    # 获取最后一次全量备份时间
    LAST_FULL_BACKUP=$(echo "$BACKUP_INFO" | grep -A 5 "full backup" | grep "timestamp:" | awk '{print $2}')
    if [ -n "$LAST_FULL_BACKUP" ]; then
        LAST_FULL_BACKUP_TIMESTAMP=$(date -d "$LAST_FULL_BACKUP" +%s 2>/dev/null)
        if [ $? -eq 0 ]; then
            sed -i "s/pgbackrest_last_full_backup_timestamp 0/pgbackrest_last_full_backup_timestamp $LAST_FULL_BACKUP_TIMESTAMP/" $METRICS_FILE
        fi
    fi
    
    # 获取最后一次增量备份时间
    LAST_INCREMENTAL_BACKUP=$(echo "$BACKUP_INFO" | grep -A 5 "incr backup" | grep "timestamp:" | awk '{print $2}')
    if [ -n "$LAST_INCREMENTAL_BACKUP" ]; then
        LAST_INCREMENTAL_BACKUP_TIMESTAMP=$(date -d "$LAST_INCREMENTAL_BACKUP" +%s 2>/dev/null)
        if [ $? -eq 0 ]; then
            sed -i "s/pgbackrest_last_incremental_backup_timestamp 0/pgbackrest_last_incremental_backup_timestamp $LAST_INCREMENTAL_BACKUP_TIMESTAMP/" $METRICS_FILE
        fi
    fi
fi

# 设置metrics文件权限
chown node_exporter:node_exporter $METRICS_FILE
chmod 644 $METRICS_FILE
```

#### 5.1.2 配置node_exporter

```bash
# 安装node_exporter
# 下载node_exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz

# 解压并安装
tar xvf node_exporter-1.6.0.linux-amd64.tar.gz
cd node_exporter-1.6.0.linux-amd64
cp node_exporter /usr/local/bin/

# 创建node_exporter用户
useradd -M -r -s /bin/false node_exporter

# 创建systemd服务文件
cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter --collector.textfile.directory=/var/lib/node_exporter/textfile_collector

[Install]
WantedBy=multi-user.target
EOF

# 启动node_exporter
systemctl daemon-reload
systemctl enable node_exporter
systemctl start node_exporter
```

#### 5.1.3 配置Prometheus监控node_exporter

修改Prometheus配置文件`/etc/prometheus/prometheus.yml`，添加node_exporter监控：

```yaml
scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']
```

重启Prometheus服务：

```bash
systemctl restart prometheus
```

#### 5.1.4 配置Grafana仪表盘

1. 登录Grafana
2. 点击"+" > "Import"
3. 输入仪表盘ID：1860（Node Exporter Full）
4. 选择Prometheus数据源
5. 点击"Import"

### 5.2 配置Alertmanager告警

#### 5.2.1 创建告警规则

创建告警规则文件`/etc/prometheus/rules/pgbackrest.rules.yml`：

```yaml
groups:
- name: pgbackrest_alerts
  rules:
    # 备份状态异常告警
    - alert: PgbackrestBackupStatusError
      expr: pgbackrest_backup_status == 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pgbackrest backup status error"
        description: "Pgbackrest backup status is error for more than 5 minutes."
    
    # 全量备份延迟告警
    - alert: PgbackrestFullBackupDelay
      expr: time() - pgbackrest_last_full_backup_timestamp > 7 * 24 * 60 * 60
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Pgbackrest full backup delay"
        description: "Full backup has not been executed for more than 7 days."
    
    # 增量备份延迟告警
    - alert: PgbackrestIncrementalBackupDelay
      expr: time() - pgbackrest_last_incremental_backup_timestamp > 24 * 60 * 60
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Pgbackrest incremental backup delay"
        description: "Incremental backup has not been executed for more than 24 hours."
```

#### 5.2.2 配置Prometheus使用告警规则

修改Prometheus配置文件`/etc/prometheus/prometheus.yml`，添加告警规则配置：

```yaml
rule_files:
  - /etc/prometheus/rules/pgbackrest.rules.yml
```

重启Prometheus服务：

```bash
systemctl restart prometheus
```

## 6. 自动化备份管理

### 6.1 查看备份状态

```bash
# 查看systemd定时器状态
systemctl list-timers --all | grep pgbackrest

# 查看备份日志
journalctl -u pgbackrest-full-backup.service
journalctl -u pgbackrest-incremental-backup.service

# 查看pgBackRest日志
cat /var/log/pgbackrest/*.log
```

### 6.2 手动执行备份

```bash
# 手动执行全量备份
systemctl start pgbackrest-full-backup.service

# 手动执行增量备份
systemctl start pgbackrest-incremental-backup.service
```

### 6.3 暂停和恢复备份

```bash
# 暂停全量备份定时器
systemctl stop pgbackrest-full-backup.timer

# 恢复全量备份定时器
systemctl start pgbackrest-full-backup.timer

# 暂停增量备份定时器
systemctl stop pgbackrest-incremental-backup.timer

# 恢复增量备份定时器
systemctl start pgbackrest-incremental-backup.timer
```

## 7. 自动化备份最佳实践

1. **定期检查备份状态**：定期检查备份状态和日志，确保备份正常执行
2. **定期测试恢复**：定期测试恢复功能，确保备份数据可用
3. **监控备份延迟**：配置告警，当备份延迟时及时通知
4. **使用多个备份存储**：将备份数据存储在多个位置，提高数据安全性
5. **合理设置备份保留策略**：根据业务需求设置备份保留期限，避免存储空间浪费
6. **使用压缩备份**：启用备份压缩，减少存储空间占用
7. **定期清理过期备份**：根据保留策略定期清理过期备份

## 8. 故障排除

### 8.1 备份执行失败

1. **查看日志**：
   ```bash
   journalctl -u pgbackrest-full-backup.service
   cat /var/log/pgbackrest/*.log
   ```

2. **检查权限**：
   ```bash
   ls -la /usr/local/bin/pgbackrest-full-backup.sh
   ls -la /backup/pgbackrest
   ```

3. **检查pgBackRest配置**：
   ```bash
   pgbackrest --stanza=postgres check
   ```

### 8.2 定时器不执行

1. **检查定时器状态**：
   ```bash
   systemctl status pgbackrest-full-backup.timer
   ```

2. **检查定时器日志**：
   ```bash
   journalctl -u pgbackrest-full-backup.timer
   ```

3. **检查systemd状态**：
   ```bash
   systemctl status systemd-timers.target
   ```

### 8.3 监控指标不更新

1. **检查监控脚本**：
   ```bash
   /usr/local/bin/monitor_backup_status.sh
   cat /var/lib/node_exporter/textfile_collector/pgbackrest.prom
   ```

2. **检查node_exporter状态**：
   ```bash
   systemctl status node_exporter
   ```

3. **检查Prometheus配置**：
   ```bash
   promtool check config /etc/prometheus/prometheus.yml
   ```

## 9. 总结

本文档详细介绍了认知辅助系统数据库自动化备份的部署方案，包括使用systemd定时器配置自动化备份、监控备份状态和配置告警等内容。通过实施本方案，可以确保数据库备份任务自动执行，提高备份的可靠性和一致性，减少人为错误，同时通过监控和告警及时发现和解决备份问题。

自动化备份是数据库运维的重要组成部分，合理的自动化备份方案可以确保数据库数据的安全可靠，在数据丢失或系统故障时能够快速恢复，减少业务中断时间，保障系统的正常运行和用户体验。