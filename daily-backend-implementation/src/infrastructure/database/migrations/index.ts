/**
 * 迁移索引文件
 * 导出所有迁移文件，用于按顺序执行
 */

import * as migration001 from './001-create-users';
import * as migration002 from './002-create-cognitive-models';
import * as migration003 from './003-create-thought-fragments';
import * as migration004 from './004-create-cognitive-insights';
import * as migration005 from './005-create-suggestions';

// 迁移列表，按顺序排列
export const migrations = [
  { version: 1, up: migration001.up, down: migration001.down },
  { version: 2, up: migration002.up, down: migration002.down },
  { version: 3, up: migration003.up, down: migration003.down },
  { version: 4, up: migration004.up, down: migration004.down },
  { version: 5, up: migration005.up, down: migration005.down },
];

// 导出最后一个迁移的版本号
export const latestMigrationVersion = migrations.length;
