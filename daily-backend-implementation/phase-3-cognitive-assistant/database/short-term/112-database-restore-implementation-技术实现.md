# 112-数据库恢复实现代码

## 1. 数据库恢复概述

数据库恢复是指将数据库从备份状态恢复到正常运行状态的过程。恢复过程包括恢复备份数据和应用事务日志，以确保数据库的完整性和一致性。

## 2. 恢复类型

| 恢复类型 | 定义 | 适用场景 |
|----------|------|----------|
| **完整恢复** | 从全量备份恢复整个数据库 | 数据库完全丢失或损坏 |
| **时间点恢复（PITR）** | 恢复到指定的时间点 | 误操作导致数据丢失，需要恢复到特定时间点 |
| **表级恢复** | 只恢复特定的表或表空间 | 单个表数据损坏或误删除 |
| **增量恢复** | 恢复全量备份和后续的增量备份 | 数据库部分损坏，需要恢复到最近的备份时间点 |

## 3. 恢复工具选型

### 3.1 工具比较

| 工具名称 | 类型 | 特点 | 适用场景 |
|----------|------|------|----------|
| **pgBackRest** | 第三方工具 | 支持全量恢复、增量恢复、时间点恢复，并行恢复 | 大型数据库、高并发环境 |
| **pg_restore** | PostgreSQL原生工具 | 支持从pg_dump备份恢复，支持选择性恢复 | 小型数据库、选择性恢复 |
| **Barman** | 第三方工具 | 支持全量恢复、增量恢复、PITR，管理多个服务器的恢复 | 企业级部署、多服务器管理 |

### 3.2 推荐工具

**推荐工具**：pgBackRest
- 理由：支持多种恢复类型，恢复速度快，支持并行恢复，适合中大型数据库
- 版本：2.47及以上

## 4. 恢复前准备

### 4.1 检查备份状态

```bash
# 检查备份状态
pgbackrest --stanza=postgres info

# 验证备份完整性
pgbackrest --stanza=postgres check
```

### 4.2 停止数据库服务

```bash
# 停止PostgreSQL服务
systemctl stop postgresql-14

# 或使用pg_ctl停止
sudo -u postgres pg_ctl -D /var/lib/postgresql/14/main stop
```

### 4.3 清理旧数据

```bash
# 清理旧的数据库数据
rm -rf /var/lib/postgresql/14/main/*

# 设置权限
chown -R postgres:postgres /var/lib/postgresql/14/main
chmod 700 /var/lib/postgresql/14/main
```

## 5. 完整恢复实现

### 5.1 基本完整恢复

创建完整恢复脚本`full_restore.sh`：

```bash
#!/bin/bash

# 完整恢复脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
PG_DATA_DIR="/var/lib/postgresql/14/main"
LOG_FILE="/var/log/pgbackrest/full_restore_$(date +%Y%m%d_%H%M%S).log"

# 停止数据库服务
echo "停止数据库服务，时间：$(date)" >> $LOG_FILE
systemctl stop postgresql-14
if [ $? -ne 0 ]; then
    echo "停止数据库服务失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库服务已停止，时间：$(date)" >> $LOG_FILE

# 清理旧数据
echo "清理旧数据库数据，时间：$(date)" >> $LOG_FILE
rm -rf $PG_DATA_DIR/*
chown -R postgres:postgres $PG_DATA_DIR
chmod 700 $PG_DATA_DIR

echo "旧数据库数据已清理，时间：$(date)" >> $LOG_FILE

# 执行完整恢复
echo "开始执行完整恢复，时间：$(date)" >> $LOG_FILE
echo "恢复参数：STANZA=$STANZA, PG_DATA_DIR=$PG_DATA_DIR" >> $LOG_FILE

pgbackrest --stanza=$STANZA restore --pg1-path=$PG_DATA_DIR >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "完整恢复执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "完整恢复执行成功，时间：$(date)" >> $LOG_FILE

# 启动数据库服务
echo "启动数据库服务，时间：$(date)" >> $LOG_FILE
systemctl start postgresql-14
if [ $? -ne 0 ]; then
    echo "启动数据库服务失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库服务已启动，时间：$(date)" >> $LOG_FILE

# 验证数据库状态
echo "验证数据库状态，时间：$(date)" >> $LOG_FILE
sleep 10
sudo -u postgres psql -c "SELECT version();" >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "数据库状态验证失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库状态验证成功，时间：$(date)" >> $LOG_FILE
echo "完整恢复完成，时间：$(date)" >> $LOG_FILE

exit 0
```

### 5.2 从特定备份集恢复

创建从特定备份集恢复脚本`restore_from_set.sh`：

```bash
#!/bin/bash

# 从特定备份集恢复脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
PG_DATA_DIR="/var/lib/postgresql/14/main"
BACKUP_SET="20260108-020000F"
LOG_FILE="/var/log/pgbackrest/restore_from_set_$(date +%Y%m%d_%H%M%S).log"

# 停止数据库服务
echo "停止数据库服务，时间：$(date)" >> $LOG_FILE
systemctl stop postgresql-14
if [ $? -ne 0 ]; then
    echo "停止数据库服务失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库服务已停止，时间：$(date)" >> $LOG_FILE

# 清理旧数据
echo "清理旧数据库数据，时间：$(date)" >> $LOG_FILE
rm -rf $PG_DATA_DIR/*
chown -R postgres:postgres $PG_DATA_DIR
chmod 700 $PG_DATA_DIR

echo "旧数据库数据已清理，时间：$(date)" >> $LOG_FILE

# 执行从特定备份集恢复
echo "开始执行从特定备份集恢复，时间：$(date)" >> $LOG_FILE
echo "恢复参数：STANZA=$STANZA, PG_DATA_DIR=$PG_DATA_DIR, BACKUP_SET=$BACKUP_SET" >> $LOG_FILE

pgbackrest --stanza=$STANZA restore --pg1-path=$PG_DATA_DIR --set=$BACKUP_SET >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "从特定备份集恢复执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "从特定备份集恢复执行成功，时间：$(date)" >> $LOG_FILE

# 启动数据库服务
echo "启动数据库服务，时间：$(date)" >> $LOG_FILE
systemctl start postgresql-14
if [ $? -ne 0 ]; then
    echo "启动数据库服务失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库服务已启动，时间：$(date)" >> $LOG_FILE

# 验证数据库状态
echo "验证数据库状态，时间：$(date)" >> $LOG_FILE
sleep 10
sudo -u postgres psql -c "SELECT version();" >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "数据库状态验证失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库状态验证成功，时间：$(date)" >> $LOG_FILE
echo "从特定备份集恢复完成，时间：$(date)" >> $LOG_FILE

exit 0
```

## 6. 时间点恢复实现

### 6.1 基本时间点恢复

创建时间点恢复脚本`pitr_restore.sh`：

```bash
#!/bin/bash

# 时间点恢复脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
PG_DATA_DIR="/var/lib/postgresql/14/main"
# 恢复到2026年1月8日10点30分
RESTORE_TIME="2026-01-08 10:30:00"
LOG_FILE="/var/log/pgbackrest/pitr_restore_$(date +%Y%m%d_%H%M%S).log"

# 停止数据库服务
echo "停止数据库服务，时间：$(date)" >> $LOG_FILE
systemctl stop postgresql-14
if [ $? -ne 0 ]; then
    echo "停止数据库服务失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库服务已停止，时间：$(date)" >> $LOG_FILE

# 清理旧数据
echo "清理旧数据库数据，时间：$(date)" >> $LOG_FILE
rm -rf $PG_DATA_DIR/*
chown -R postgres:postgres $PG_DATA_DIR
chmod 700 $PG_DATA_DIR

echo "旧数据库数据已清理，时间：$(date)" >> $LOG_FILE

# 执行时间点恢复
echo "开始执行时间点恢复，时间：$(date)" >> $LOG_FILE
echo "恢复参数：STANZA=$STANZA, PG_DATA_DIR=$PG_DATA_DIR, RESTORE_TIME=$RESTORE_TIME" >> $LOG_FILE

pgbackrest --stanza=$STANZA restore --pg1-path=$PG_DATA_DIR --type=time --target="$RESTORE_TIME" >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "时间点恢复执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "时间点恢复执行成功，时间：$(date)" >> $LOG_FILE

# 启动数据库服务
echo "启动数据库服务，时间：$(date)" >> $LOG_FILE
systemctl start postgresql-14
if [ $? -ne 0 ]; then
    echo "启动数据库服务失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库服务已启动，时间：$(date)" >> $LOG_FILE

# 验证数据库状态
echo "验证数据库状态，时间：$(date)" >> $LOG_FILE
sleep 10
sudo -u postgres psql -c "SELECT version();" >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "数据库状态验证失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库状态验证成功，时间：$(date)" >> $LOG_FILE
echo "时间点恢复完成，时间：$(date)" >> $LOG_FILE

exit 0
```

### 6.2 使用事务ID恢复

创建事务ID恢复脚本`txid_restore.sh`：

```bash
#!/bin/bash

# 事务ID恢复脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
STANZA="postgres"
PG_DATA_DIR="/var/lib/postgresql/14/main"
# 恢复到指定的事务ID
RESTORE_TXID="123456789"
LOG_FILE="/var/log/pgbackrest/txid_restore_$(date +%Y%m%d_%H%M%S).log"

# 停止数据库服务
echo "停止数据库服务，时间：$(date)" >> $LOG_FILE
systemctl stop postgresql-14
if [ $? -ne 0 ]; then
    echo "停止数据库服务失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库服务已停止，时间：$(date)" >> $LOG_FILE

# 清理旧数据
echo "清理旧数据库数据，时间：$(date)" >> $LOG_FILE
rm -rf $PG_DATA_DIR/*
chown -R postgres:postgres $PG_DATA_DIR
chmod 700 $PG_DATA_DIR

echo "旧数据库数据已清理，时间：$(date)" >> $LOG_FILE

# 执行事务ID恢复
echo "开始执行事务ID恢复，时间：$(date)" >> $LOG_FILE
echo "恢复参数：STANZA=$STANZA, PG_DATA_DIR=$PG_DATA_DIR, RESTORE_TXID=$RESTORE_TXID" >> $LOG_FILE

pgbackrest --stanza=$STANZA restore --pg1-path=$PG_DATA_DIR --type=txid --target="$RESTORE_TXID" >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "事务ID恢复执行失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "事务ID恢复执行成功，时间：$(date)" >> $LOG_FILE

# 启动数据库服务
echo "启动数据库服务，时间：$(date)" >> $LOG_FILE
systemctl start postgresql-14
if [ $? -ne 0 ]; then
    echo "启动数据库服务失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库服务已启动，时间：$(date)" >> $LOG_FILE

# 验证数据库状态
echo "验证数据库状态，时间：$(date)" >> $LOG_FILE
sleep 10
sudo -u postgres psql -c "SELECT version();" >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "数据库状态验证失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "数据库状态验证成功，时间：$(date)" >> $LOG_FILE
echo "事务ID恢复完成，时间：$(date)" >> $LOG_FILE

exit 0
```

## 7. 表级恢复实现

### 7.1 使用pg_restore进行表级恢复

创建表级恢复脚本`table_restore.sh`：

```bash
#!/bin/bash

# 表级恢复脚本
# 作者：数据库团队
# 日期：2026-01-08
# 版本：1.0

# 配置参数
DB_NAME="cognitive_assistant"
TABLE_NAME="user_cognitive_model"
BACKUP_FILE="/backup/pgbackrest/$(ls -t /backup/pgbackrest | grep -i full | head -1)"
LOG_FILE="/var/log/pgbackrest/table_restore_$(date +%Y%m%d_%H%M%S).log"

# 创建临时数据库用于恢复
echo "创建临时数据库，时间：$(date)" >> $LOG_FILE
sudo -u postgres createdb temp_restore_db
if [ $? -ne 0 ]; then
    echo "创建临时数据库失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "临时数据库已创建，时间：$(date)" >> $LOG_FILE

# 恢复整个数据库到临时数据库
echo "开始恢复数据库到临时数据库，时间：$(date)" >> $LOG_FILE
pg_restore -d temp_restore_db $BACKUP_FILE >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "恢复数据库到临时数据库失败，时间：$(date)" >> $LOG_FILE
    sudo -u postgres dropdb temp_restore_db
    exit 1
fi

echo "恢复数据库到临时数据库成功，时间：$(date)" >> $LOG_FILE

# 导出需要恢复的表
echo "导出需要恢复的表，时间：$(date)" >> $LOG_FILE
sudo -u postgres pg_dump -t $TABLE_NAME temp_restore_db > /tmp/$TABLE_NAME.sql
if [ $? -ne 0 ]; then
    echo "导出表失败，时间：$(date)" >> $LOG_FILE
    sudo -u postgres dropdb temp_restore_db
    exit 1
fi

echo "导出表成功，时间：$(date)" >> $LOG_FILE

# 恢复表到目标数据库
echo "开始恢复表到目标数据库，时间：$(date)" >> $LOG_FILE
# 先删除目标表（如果存在）
sudo -u postgres psql -d $DB_NAME -c "DROP TABLE IF EXISTS $TABLE_NAME CASCADE;" >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "删除目标表失败，时间：$(date)" >> $LOG_FILE
    sudo -u postgres dropdb temp_restore_db
    exit 1
fi

# 恢复表
sudo -u postgres psql -d $DB_NAME -f /tmp/$TABLE_NAME.sql >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "恢复表到目标数据库失败，时间：$(date)" >> $LOG_FILE
    sudo -u postgres dropdb temp_restore_db
    rm -f /tmp/$TABLE_NAME.sql
    exit 1
fi

echo "恢复表到目标数据库成功，时间：$(date)" >> $LOG_FILE

# 清理临时文件
echo "清理临时文件，时间：$(date)" >> $LOG_FILE
sudo -u postgres dropdb temp_restore_db
rm -f /tmp/$TABLE_NAME.sql

echo "临时文件已清理，时间：$(date)" >> $LOG_FILE

# 验证恢复结果
echo "验证恢复结果，时间：$(date)" >> $LOG_FILE
sudo -u postgres psql -d $DB_NAME -c "SELECT COUNT(*) FROM $TABLE_NAME;" >> $LOG_FILE 2>&1
if [ $? -ne 0 ]; then
    echo "验证恢复结果失败，时间：$(date)" >> $LOG_FILE
    exit 1
fi

echo "验证恢复结果成功，时间：$(date)" >> $LOG_FILE
echo "表级恢复完成，时间：$(date)" >> $LOG_FILE

exit 0
```

## 8. 恢复后验证

### 8.1 基本验证

```bash
# 验证数据库状态
sudo -u postgres psql -c "SELECT version();"

# 验证数据库连接数
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# 验证数据库表数量
sudo -u postgres psql -c "SELECT count(*) FROM pg_tables WHERE schemaname='public';"
```

### 8.2 数据完整性验证

```bash
# 验证数据完整性
sudo -u postgres psql -d cognitive_assistant -c "SELECT COUNT(*) FROM user_cognitive_model;"
sudo -u postgres psql -d cognitive_assistant -c "SELECT COUNT(*) FROM cognitive_concept;"
sudo -u postgres psql -d cognitive_assistant -c "SELECT COUNT(*) FROM cognitive_relation;"
```

### 8.3 应用功能验证

```bash
# 重启应用服务
systemctl restart cognitive-assistant

# 验证应用是否能正常连接数据库
curl -i http://localhost:3000/health
```

## 9. 恢复最佳实践

1. **恢复前准备**：在恢复前，确保停止数据库服务，清理旧数据
2. **恢复验证**：恢复后，验证数据库状态和数据完整性
3. **恢复测试**：定期进行恢复测试，确保备份数据可用
4. **恢复文档**：详细记录恢复流程和步骤，便于故障恢复
5. **恢复演练**：定期进行恢复演练，提高团队的恢复能力
6. **恢复工具**：使用可靠的恢复工具，如pgBackRest
7. **恢复速度**：优化恢复速度，减少业务中断时间

## 10. 故障排除

### 10.1 恢复失败

1. **检查日志**：查看pgBackRest日志和PostgreSQL日志
   ```bash
   cat /var/log/pgbackrest/*.log
   cat /var/log/postgresql/postgresql-14-main.log
   ```

2. **检查备份状态**：验证备份完整性
   ```bash
   pgbackrest --stanza=postgres check
   ```

3. **检查权限**：确保pgBackRest用户有足够的权限访问备份目录和数据目录
   ```bash
   ls -la /backup/pgbackrest
   ls -la /var/lib/postgresql/14/main
   ```

### 10.2 数据库无法启动

1. **检查日志**：查看PostgreSQL日志
   ```bash
   cat /var/log/postgresql/postgresql-14-main.log
   ```

2. **检查配置文件**：验证postgresql.conf和pg_hba.conf配置
   ```bash
   cat /var/lib/postgresql/14/main/postgresql.conf
   cat /var/lib/postgresql/14/main/pg_hba.conf
   ```

3. **检查数据目录权限**：确保数据目录权限正确
   ```bash
   chown -R postgres:postgres /var/lib/postgresql/14/main
   chmod 700 /var/lib/postgresql/14/main
   ```

### 10.3 数据不一致

1. **检查WAL日志**：确保所有WAL日志都已应用
   ```bash
   sudo -u postgres psql -c "SELECT pg_walfile_name(pg_current_wal_lsn());"
   ```

2. **运行数据库一致性检查**：
   ```bash
   sudo -u postgres pg_ctl -D /var/lib/postgresql/14/main stop
   sudo -u postgres pg_resetwal -f /var/lib/postgresql/14/main
   sudo -u postgres pg_ctl -D /var/lib/postgresql/14/main start
   ```

## 11. 总结

本文档详细介绍了使用pgBackRest进行PostgreSQL数据库恢复的实现方案，包括完整恢复、时间点恢复和表级恢复等多种恢复类型。通过实施本方案，可以确保在数据丢失或系统故障时能够快速恢复数据库，减少业务中断时间，保障系统的正常运行和用户体验。

恢复是数据库备份策略的重要组成部分，合理的恢复方案可以确保备份数据的可用性和可靠性，同时提高恢复的效率和成功率。定期进行恢复测试和演练，可以提高团队的恢复能力，确保在实际故障发生时能够快速、准确地恢复数据库。