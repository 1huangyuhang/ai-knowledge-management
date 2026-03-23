# 110-增量备份实现代码

## 1. 增量备份概述

增量备份是指备份自上次全量备份或增量备份以来发生变化的数据。增量备份可以减少备份时间和存储空间，用于快速恢复到最近的备份时间点。

## 2. 增量备份原理

1. **基于WAL日志的备份**：PostgreSQL的WAL（Write-Ahead Logging）日志记录了所有数据库的修改操作
2. **备份链**：增量备份形成一个备份链，从全量备份开始，后续是一系列增量备份
3. **恢复过程**：恢复时需要先恢复全量备份，然后依次恢复所有增量备份，最后应用WAL日志

## 3. 增量备份工具选型

### 3.1 工具比较

| 工具名称 | 类型 | 特点 | 适用场景 |
|----------|------|------|----------|
| **pgBackRest** | 第三方工具 | 支持全量备份、增量备份、差异备份，并行备份，压缩备份 | 大型数据库、高并发环境 |
| **Barman** | 第三方工具 | 支持全量备份、增量备份、PITR，管理多个服务器的备份 | 企业级部署、多服务器管理 |
| **pg_probackup** | PostgreSQL原生工具 | 支持全量备份、增量备份、差异备份，备份验证 | 中大型数据库、需要PITR的场景 |

### 3.2 推荐工具

**推荐工具**：pgBackRest
- 理由：支持多种备份类型，备份速度快，支持压缩和并行备份，适合中大型数据库
- 版本：2.47及以上

## 4. pgBackRest增量备份配置

### 4.1 前提条件

1. 已完成全量备份配置
2. PostgreSQL已启用WAL归档
3. pgBackRest已正确安装和配置

### 4.2 配置文件修改

pgBackRest配置文件与全量备份相同，无需额外修改。

## 5. 增量备份脚本实现

### 5.1 基本增量备份脚本

创建增量备份脚本`incremental_backup.sh`：

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
    
    exit 0
else
    echo "增量备份执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi
```

### 5.2 带验证的增量备份脚本

创建带验证的增量备份脚本`incremental_backup_with_verify.sh`：

```bash
#!/bin/bash

# 带验证的增量备份脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
BACKUP_TYPE="incr"
LOG_FILE="/var/log/pgbackrest/incremental_backup_with_verify_$(date +%Y%m%d_%H%M%S).log"

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
        exit 1
    fi
else
    echo "增量备份执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi
```

### 5.3 远程增量备份脚本

创建远程增量备份脚本`remote_incremental_backup.sh`：

```bash
#!/bin/bash

# 远程增量备份脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
BACKUP_TYPE="incr"
LOG_FILE="/var/log/pgbackrest/remote_incremental_backup_$(date +%Y%m%d_%H%M%S).log"
PG_HOST="192.168.1.100"
PG_PORT="5432"
PG_USER="postgres"
BACKREST_USER="pgbackrest"

# 执行远程备份
echo "开始执行远程增量备份，时间：$(date)" >> $LOG_FILE
echo "备份参数：STANZA=$STANZA, BACKUP_TYPE=$BACKUP_TYPE, PG_HOST=$PG_HOST" >> $LOG_FILE

pgbackrest --stanza=$STANZA backup --type=$BACKUP_TYPE --pg1-host=$PG_HOST --pg1-port=$PG_PORT --pg1-user=$PG_USER --pg1-host-user=$BACKREST_USER >> $LOG_FILE 2>&1

# 检查备份结果
if [ $? -eq 0 ]; then
    echo "远程增量备份执行成功，时间：$(date)" >> $LOG_FILE
    
    # 获取备份信息
    echo "备份信息：" >> $LOG_FILE
    pgbackrest --stanza=$STANZA info >> $LOG_FILE 2>&1
    
    exit 0
else
    echo "远程增量备份执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi
```

## 6. 增量备份自动化配置

### 6.1 使用cron配置定时备份

```bash
# 编辑cron配置
crontab -e -u pgbackrest

# 添加以下内容，每天凌晨1点执行增量备份
0 1 * * * /path/to/incremental_backup_with_verify.sh
```

### 6.2 使用systemd定时器配置

#### 6.2.1 创建service文件`/etc/systemd/system/pgbackrest-incremental-backup.service`：

```ini
[Unit]
Description=pgBackRest Incremental Backup
After=network.target

[Service]
Type=oneshot
User=pgbackrest
Group=pgbackrest
ExecStart=/path/to/incremental_backup_with_verify.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### 6.2.2 创建timer文件`/etc/systemd/system/pgbackrest-incremental-backup.timer`：

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

#### 6.2.3 启动并启用定时器：

```bash
systemctl daemon-reload
systemctl enable pgbackrest-incremental-backup.timer
systemctl start pgbackrest-incremental-backup.timer
systemctl list-timers --all | grep pgbackrest
```

## 7. 增量备份监控

### 7.1 监控备份状态

创建增量备份状态监控脚本`monitor_incremental_backup.sh`：

```bash
#!/bin/bash

# 增量备份状态监控脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
ALERT_EMAIL="db-admin@example.com"
LOG_FILE="/var/log/pgbackrest/monitor_incremental_backup_$(date +%Y%m%d_%H%M%S).log"

# 检查备份状态
echo "开始检查增量备份状态，时间：$(date)" >> $LOG_FILE

# 获取最近的增量备份信息
LAST_INCREMENTAL_BACKUP=$(pgbackrest --stanza=$STANZA info | grep -A 5 "incr backup")
echo "最近的增量备份信息：" >> $LOG_FILE
echo "$LAST_INCREMENTAL_BACKUP" >> $LOG_FILE

# 检查是否存在增量备份
if echo "$LAST_INCREMENTAL_BACKUP" | grep -q "incr backup"; then
    # 检查备份是否成功
    if echo "$LAST_INCREMENTAL_BACKUP" | grep -q "status: ok"; then
        echo "增量备份状态正常，时间：$(date)" >> $LOG_FILE
        
        # 检查增量备份是否在最近24小时内
        LAST_BACKUP_DATE=$(echo "$LAST_INCREMENTAL_BACKUP" | grep "timestamp:" | awk '{print $2}')
        LAST_BACKUP_TIMESTAMP=$(date -d "$LAST_BACKUP_DATE" +%s)
        CURRENT_TIMESTAMP=$(date +%s)
        TIME_DIFF=$((CURRENT_TIMESTAMP - LAST_BACKUP_TIMESTAMP))
        
        if [ $TIME_DIFF -gt 86400 ]; then
            echo "增量备份超过24小时未执行，时间：$(date)" >> $LOG_FILE
            # 发送告警邮件
            echo "增量备份超过24小时未执行，请检查备份配置。" | mail -s "[告警] PostgreSQL增量备份延迟" $ALERT_EMAIL
            exit 1
        else
            echo "增量备份在24小时内执行，状态正常，时间：$(date)" >> $LOG_FILE
            exit 0
        fi
    else
        echo "增量备份状态异常，时间：$(date)" >> $LOG_FILE
        # 发送告警邮件
        echo "增量备份状态异常，请检查备份日志。" | mail -s "[告警] PostgreSQL增量备份状态异常" $ALERT_EMAIL
        exit 1
    fi
else
    echo "未找到增量备份，时间：$(date)" >> $LOG_FILE
    # 发送告警邮件
    echo "未找到增量备份，请检查备份配置。" | mail -s "[告警] PostgreSQL增量备份不存在" $ALERT_EMAIL
    exit 1
fi
```

### 7.2 配置监控定时器

```bash
# 使用cron配置，每6小时检查一次增量备份状态
0 */6 * * * /path/to/monitor_incremental_backup.sh
```

## 8. 增量备份恢复测试

### 8.1 基本恢复测试

创建增量恢复测试脚本`incremental_restore_test.sh`：

```bash
#!/bin/bash

# 增量备份恢复测试脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
RESTORE_DIR="/tmp/pg_incremental_restore_test"
LOG_FILE="/var/log/pgbackrest/incremental_restore_test_$(date +%Y%m%d_%H%M%S).log"

# 创建恢复目录
mkdir -p $RESTORE_DIR
chown -R postgres:postgres $RESTORE_DIR
chmod 700 $RESTORE_DIR

echo "开始执行增量恢复测试，时间：$(date)" >> $LOG_FILE
echo "恢复参数：STANZA=$STANZA, RESTORE_DIR=$RESTORE_DIR" >> $LOG_FILE

# 执行恢复（会自动恢复全量备份+所有增量备份）
pgbackrest --stanza=$STANZA restore --pg1-path=$RESTORE_DIR >> $LOG_FILE 2>&1

# 检查恢复结果
if [ $? -eq 0 ]; then
    echo "增量恢复测试执行成功，时间：$(date)" >> $LOG_FILE
    
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
    
    echo "增量恢复测试完成，时间：$(date)" >> $LOG_FILE
    exit 0
else
    echo "增量恢复测试执行失败，时间：$(date)" >> $LOG_FILE
    # 清理恢复目录
    rm -rf $RESTORE_DIR
    exit 1
fi
```

### 8.2 时间点恢复测试

创建时间点恢复测试脚本`pitr_restore_test.sh`：

```bash
#!/bin/bash

# 时间点恢复测试脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
RESTORE_DIR="/tmp/pg_pitr_restore_test"
LOG_FILE="/var/log/pgbackrest/pitr_restore_test_$(date +%Y%m%d_%H%M%S).log"
# 恢复到2小时前的时间点
RESTORE_TIME="$(date -d "2 hours ago" +%Y-%m-%d%H:%M:%S)"

echo "恢复时间点：$RESTORE_TIME" >> $LOG_FILE

# 创建恢复目录
mkdir -p $RESTORE_DIR
chown -R postgres:postgres $RESTORE_DIR
chmod 700 $RESTORE_DIR

echo "开始执行时间点恢复测试，时间：$(date)" >> $LOG_FILE
echo "恢复参数：STANZA=$STANZA, RESTORE_DIR=$RESTORE_DIR, RESTORE_TIME=$RESTORE_TIME" >> $LOG_FILE

# 执行时间点恢复
pgbackrest --stanza=$STANZA restore --pg1-path=$RESTORE_DIR --type=time --target="$RESTORE_TIME" >> $LOG_FILE 2>&1

# 检查恢复结果
if [ $? -eq 0 ]; then
    echo "时间点恢复测试执行成功，时间：$(date)" >> $LOG_FILE
    
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
    
    echo "时间点恢复测试完成，时间：$(date)" >> $LOG_FILE
    exit 0
else
    echo "时间点恢复测试执行失败，时间：$(date)" >> $LOG_FILE
    # 清理恢复目录
    rm -rf $RESTORE_DIR
    exit 1
fi
```

## 9. 增量备份管理

### 9.1 查看备份链

```bash
# 查看备份链信息
pgbackrest --stanza=postgres info
```

### 9.2 删除旧备份

```bash
# 根据retention配置自动删除旧备份
pgbackrest --stanza=postgres expire

# 手动删除指定备份
pgbackrest --stanza=postgres delete --set=<backup-set>
```

### 9.3 备份验证

```bash
# 验证备份完整性
pgbackrest --stanza=postgres check

# 验证特定备份集
pgbackrest --stanza=postgres check --set=<backup-set>
```

## 10. 最佳实践

1. **合理设置备份频率**：根据业务需求设置增量备份频率，建议每天一次
2. **备份链管理**：定期清理旧的备份链，避免备份链过长影响恢复速度
3. **备份验证**：每次增量备份后，执行备份验证，确保备份数据的完整性
4. **多副本存储**：将备份数据存储在多个位置，提高数据安全性
5. **监控备份状态**：定期检查增量备份状态，及时发现和解决备份问题
6. **恢复测试**：定期进行恢复测试，确保恢复流程的有效性
7. **文档记录**：详细记录备份配置和恢复流程，便于故障恢复

## 11. 故障排除

### 11.1 常见问题

1. **增量备份失败**
   - 检查pgBackRest日志文件：`/var/log/pgbackrest/*.log`
   - 检查PostgreSQL日志文件：`/var/log/postgresql/postgresql-14-main.log`
   - 检查WAL归档是否正常
   - 检查全量备份是否存在

2. **备份链断裂**
   - 原因：中间的备份文件丢失或损坏
   - 解决方法：重新执行全量备份，建立新的备份链

3. **恢复失败**
   - 检查备份链是否完整
   - 检查WAL日志是否完整
   - 检查恢复命令是否正确

### 11.2 日志查看

```bash
# 查看pgBackRest日志
cat /var/log/pgbackrest/*.log

# 查看PostgreSQL日志
cat /var/log/postgresql/postgresql-14-main.log

# 查看备份信息
pgbackrest --stanza=postgres info
```

## 12. 总结

本文档详细介绍了使用pgBackRest进行PostgreSQL增量备份的实现方案，包括工具选型、配置、备份脚本实现、自动化配置、监控和恢复测试等内容。通过实施本方案，可以确保数据库数据的安全可靠，在数据丢失或系统故障时能够快速恢复，减少业务中断时间，保障系统的正常运行和用户体验。