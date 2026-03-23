"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    const connection = await db.getConnection();
    await connection.run(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      description TEXT NOT NULL,
      priority INTEGER NOT NULL,
      confidence REAL NOT NULL,
      related_concepts TEXT NOT NULL,
      action_items TEXT NOT NULL,
      category TEXT NOT NULL,
      metadata TEXT NOT NULL,
      user_id TEXT NOT NULL,
      cognitive_model_id TEXT NOT NULL,
      context TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cognitive_model_id) REFERENCES cognitive_models(id)
    );
  `);
    await connection.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);`);
    await connection.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_cognitive_model_id ON suggestions(cognitive_model_id);`);
    await connection.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_type ON suggestions(type);`);
    await connection.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions(category);`);
    await connection.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_priority ON suggestions(priority);`);
}
async function down(db) {
    const connection = await db.getConnection();
    await connection.run(`DROP TABLE IF EXISTS suggestions;`);
}
//# sourceMappingURL=005-create-suggestions.js.map