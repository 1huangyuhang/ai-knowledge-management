# 109-全量备份实现代码

## 1. 全量备份概述

全量备份是指备份数据库的完整内容，包括所有表、索引、存储过程等。全量备份是数据恢复的基础，用于完整恢复数据库到某个时间点的状态。

## 2. 全量备份工具选型

### 2.1 工具比较

| 工具名称 | 类型 | 特点 | 适用场景 |
|----------|------|------|----------|
| **pg_dump** | PostgreSQL原生工具 | 支持全量备份、选择性备份，备份格式多样 | 小型数据库、定期全量备份 |
| **pg_basebackup** | PostgreSQL原生工具 | 支持基础备份（全量），适合PITR（时间点恢复） | 中大型数据库、需要PITR的场景 |
| **pgBackRest** | 第三方工具 | 支持全量备份、增量备份、差异备份，并行备份，压缩备份 | 大型数据库、高并发环境 |

### 2.2 推荐工具

**推荐工具**：pgBackRest
- 理由：支持多种备份类型，备份速度快，支持压缩和并行备份，适合中大型数据库
- 版本：2.47及以上

## 3. pgBackRest安装与配置

### 3.1 安装pgBackRest

#### 3.1.1 在PostgreSQL服务器上安装

```bash
# Ubuntu/Debian
apt-get update
apt-get install -y pgbackrest

# CentOS/RHEL
yum install -y pgbackrest

# macOS
brew install pgbackrest
```

#### 3.1.2 在备份服务器上安装

```bash
# Ubuntu/Debian
apt-get update
apt-get install -y pgbackrest

# CentOS/RHEL
yum install -y pgbackrest

# macOS
brew install pgbackrest
```

### 3.2 配置pgBackRest

#### 3.2.1 PostgreSQL服务器配置

1. 修改PostgreSQL配置文件`postgresql.conf`：

```ini
# 启用归档模式
archive_mode = on
archive_command = 'pgbackrest --stanza=postgres archive-push %p'
archive_timeout = 60

# 启用WAL日志归档
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
```

2. 修改pg_hba.conf文件，添加pgBackRest用户权限：

```
# 允许pgBackRest用户访问
local   replication     pgbackrest                               trust
host    replication     pgbackrest  127.0.0.1/32            trust
host    replication     pgbackrest  ::1/128                 trust
# 如果备份服务器在远程，添加远程IP
# host    replication     pgbackrest  <backup-server-ip>/32   trust
```

3. 创建pgBackRest用户和目录：

```bash
# 创建pgBackRest用户
useradd -m -s /bin/bash pgbackrest

# 设置密码
echo "pgbackrest:pgbackrest" | chpasswd

# 添加到postgres组
usermod -aG postgres pgbackrest

# 创建pgBackRest工作目录
mkdir -p /var/lib/pgbackrest
chown -R pgbackrest:pgbackrest /var/lib/pgbackrest
chmod 750 /var/lib/pgbackrest

# 创建日志目录
mkdir -p /var/log/pgbackrest
chown -R pgbackrest:pgbackrest /var/log/pgbackrest
```

#### 3.2.2 pgBackRest配置文件

创建pgBackRest配置文件`/etc/pgbackrest.conf`：

```ini
# 全局配置
[global]
repo1-path=/var/lib/pgbackrest
repo1-retention-full=4
repo1-retention-diff=7
repo1-retention-archive=14
repo1-compress-type=lz4
repo1-compress-level=6
log-level-file=info
log-path=/var/log/pgbackrest

# PostgreSQL实例配置
[postgres]
pg1-path=/var/lib/postgresql/14/main
pg1-port=5432
pg1-user=postgres
pg1-host=localhost
pg1-host-user=pgbackrest
```

## 4. 全量备份脚本实现

### 4.1 基本全量备份脚本

创建全量备份脚本`full_backup.sh`：

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
    
    exit 0
else
    echo "全量备份执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi
```

### 4.2 带验证的全量备份脚本

创建带验证的全量备份脚本`full_backup_with_verify.sh`：

```bash
#!/bin/bash

# 带验证的全量备份脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
BACKUP_TYPE="full"
LOG_FILE="/var/log/pgbackrest/full_backup_with_verify_$(date +%Y%m%d_%H%M%S).log"

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
        exit 1
    fi
else
    echo "全量备份执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi
```

### 4.3 远程全量备份脚本

创建远程全量备份脚本`remote_full_backup.sh`：

```bash
#!/bin/bash

# 远程全量备份脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
BACKUP_TYPE="full"
LOG_FILE="/var/log/pgbackrest/remote_full_backup_$(date +%Y%m%d_%H%M%S).log"
PG_HOST="192.168.1.100"
PG_PORT="5432"
PG_USER="postgres"
BACKREST_USER="pgbackrest"

# 执行远程备份
echo "开始执行远程全量备份，时间：$(date)" >> $LOG_FILE
echo "备份参数：STANZA=$STANZA, BACKUP_TYPE=$BACKUP_TYPE, PG_HOST=$PG_HOST" >> $LOG_FILE

pgbackrest --stanza=$STANZA backup --type=$BACKUP_TYPE --pg1-host=$PG_HOST --pg1-port=$PG_PORT --pg1-user=$PG_USER --pg1-host-user=$BACKREST_USER >> $LOG_FILE 2>&1

# 检查备份结果
if [ $? -eq 0 ]; then
    echo "远程全量备份执行成功，时间：$(date)" >> $LOG_FILE
    
    # 获取备份信息
    echo "备份信息：" >> $LOG_FILE
    pgbackrest --stanza=$STANZA info >> $LOG_FILE 2>&1
    
    exit 0
else
    echo "远程全量备份执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi
```

## 5. 全量备份自动化配置

### 5.1 使用cron配置定时备份

```bash
# 编辑cron配置
crontab -e -u pgbackrest

# 添加以下内容，每周日凌晨2点执行全量备份
0 2 * * 0 /path/to/full_backup_with_verify.sh
```

### 5.2 使用systemd定时器配置

#### 5.2.1 创建service文件`/etc/systemd/system/pgbackrest-full-backup.service`：

```ini
[Unit]
Description=pgBackRest Full Backup
After=network.target

[Service]
Type=oneshot
User=pgbackrest
Group=pgbackrest
ExecStart=/path/to/full_backup_with_verify.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### 5.2.2 创建timer文件`/etc/systemd/system/pgbackrest-full-backup.timer`：

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

#### 5.2.3 启动并启用定时器：

```bash
systemctl daemon-reload
systemctl enable pgbackrest-full-backup.timer
systemctl start pgbackrest-full-backup.timer
systemctl list-timers --all | grep pgbackrest
```

## 6. 全量备份监控

### 6.1 监控备份状态

创建备份状态监控脚本`monitor_backup_status.sh`：

```bash
#!/bin/bash

# 备份状态监控脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
ALERT_EMAIL="db-admin@example.com"
LOG_FILE="/var/log/pgbackrest/monitor_backup_status_$(date +%Y%m%d_%H%M%S).log"

# 检查备份状态
echo "开始检查备份状态，时间：$(date)" >> $LOG_FILE

# 获取最近的全量备份信息
LAST_FULL_BACKUP=$(pgbackrest --stanza=$STANZA info | grep -A 5 "full backup")
echo "最近的全量备份信息：" >> $LOG_FILE
echo "$LAST_FULL_BACKUP" >> $LOG_FILE

# 检查是否存在全量备份
if echo "$LAST_FULL_BACKUP" | grep -q "full backup"; then
    # 检查备份是否成功
    if echo "$LAST_FULL_BACKUP" | grep -q "status: ok"; then
        echo "全量备份状态正常，时间：$(date)" >> $LOG_FILE
        exit 0
    else
        echo "全量备份状态异常，时间：$(date)" >> $LOG_FILE
        # 发送告警邮件
        echo "全量备份状态异常，请检查备份日志。" | mail -s "[告警] PostgreSQL全量备份状态异常" $ALERT_EMAIL
        exit 1
    fi
else
    echo "未找到全量备份，时间：$(date)" >> $LOG_FILE
    # 发送告警邮件
    echo "未找到全量备份，请检查备份配置。" | mail -s "[告警] PostgreSQL全量备份不存在" $ALERT_EMAIL
    exit 1
fi
```

### 6.2 配置监控定时器

```bash
# 使用cron配置，每小时检查一次备份状态
0 * * * * /path/to/monitor_backup_status.sh
```

## 7. 全量备份恢复测试

### 7.1 基本恢复测试

创建恢复测试脚本`restore_test.sh`：

```bash
#!/bin/bash

# 全量备份恢复测试脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
RESTORE_DIR="/tmp/pg_restore_test"
LOG_FILE="/var/log/pgbackrest/restore_test_$(date +%Y%m%d_%H%M%S).log"

# 创建恢复目录
mkdir -p $RESTORE_DIR
chown -R postgres:postgres $RESTORE_DIR
chmod 700 $RESTORE_DIR

echo "开始执行恢复测试，时间：$(date)" >> $LOG_FILE
echo "恢复参数：STANZA=$STANZA, RESTORE_DIR=$RESTORE_DIR" >> $LOG_FILE

# 执行恢复
pgbackrest --stanza=$STANZA restore --pg1-path=$RESTORE_DIR >> $LOG_FILE 2>&1

# 检查恢复结果
if [ $? -eq 0 ]; then
    echo "恢复测试执行成功，时间：$(date)" >> $LOG_FILE
    
    # 验证恢复的数据
    echo "开始验证恢复的数据，时间：$(date)" >> $LOG_FILE
    
    # 启动测试数据库实例
    sudo -u postgres pg_ctl -D $RESTORE_DIR start >> $LOG_FILE 2>&1
    
    # 等待数据库启动
    sleep 10
    
    # 执行简单的查询验证
    sudo -u postgres psql -p 5433 -c "SELECT version();" >> $LOG_FILE 2>&1
    sudo -u postgres psql -p 5433 -c "\l" >> $LOG_FILE 2>&1
    
    # 停止测试数据库实例
    sudo -u postgres pg_ctl -D $RESTORE_DIR stop >> $LOG_FILE 2>&1
    
    # 清理恢复目录
    rm -rf $RESTORE_DIR
    
    echo "恢复测试完成，时间：$(date)" >> $LOG_FILE
    exit 0
else
    echo "恢复测试执行失败，时间：$(date)" >> $LOG_FILE
    # 清理恢复目录
    rm -rf $RESTORE_DIR
    exit 1
fi
```

## 8. 最佳实践

1. **定期执行全量备份**：建议每周执行一次全量备份
2. **备份验证**：每次全量备份后，执行备份验证，确保备份数据的完整性
3. **多副本存储**：将备份数据存储在多个位置，提高数据安全性
4. **备份压缩**：启用备份压缩，减少存储空间占用
5. **监控备份状态**：定期检查备份状态，及时发现和解决备份问题
6. **恢复测试**：定期进行恢复测试，确保恢复流程的有效性
7. **文档记录**：详细记录备份配置和恢复流程，便于故障恢复

## 9. 故障排除

### 9.1 常见问题

1. **备份失败**
   - 检查pgBackRest日志文件：`/var/log/pgbackrest/*.log`
   - 检查PostgreSQL日志文件：`/var/log/postgresql/postgresql-14-main.log`
   - 检查pgBackRest配置文件是否正确
   - 检查备份目录权限是否正确

2. **备份验证失败**
   - 检查备份数据是否损坏
   - 检查pgBackRest配置文件中的验证参数
   - 检查磁盘空间是否充足

3. **远程备份失败**
   - 检查网络连接是否正常
   - 检查PostgreSQL服务器的pg_hba.conf配置
   - 检查备份服务器的pgBackRest用户权限

### 9.2 日志查看

```bash
# 查看pgBackRest日志
cat /var/log/pgbackrest/*.log

# 查看PostgreSQL日志
cat /var/log/postgresql/postgresql-14-main.log

# 查看备份信息
pgbackrest --stanza=postgres info
```

## 10. 总结

本文档详细介绍了使用pgBackRest进行PostgreSQL全量备份的实现方案，包括工具安装与配置、备份脚本实现、自动化配置、监控和恢复测试等内容。通过实施本方案，可以确保数据库数据的安全可靠，在数据丢失或系统故障时能够快速恢复，减少业务中断时间，保障系统的正常运行和用户体验。