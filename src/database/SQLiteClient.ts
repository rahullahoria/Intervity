/**
 * SQLite Client Wrapper supporting @op-engineering/op-sqlite (C++ JSI)
 * Includes a robust in-memory driver fallback for testing & development environments
 */

import { DATABASE_SCHEMA_SQL } from './DatabaseSchema';

export interface QueryResult {
  rows: any[];
  rowsAffected: number;
  insertId?: number;
}

class InMemoryDatabaseDriver {
  private tables: Map<string, Map<string, any>> = new Map();
  private autoIncrements: Map<string, number> = new Map();

  async executeAsync(sql: string, params: any[] = []): Promise<QueryResult> {
    const trimmed = sql.trim();

    // Table creation
    if (trimmed.toUpperCase().startsWith('CREATE TABLE')) {
      const match = trimmed.match(/CREATE TABLE (?:IF NOT EXISTS )?([a-zA-Z0-9_]+)/i);
      if (match && match[1]) {
        if (!this.tables.has(match[1])) {
          this.tables.set(match[1], new Map());
          this.autoIncrements.set(match[1], 1);
        }
      }
      return { rows: [], rowsAffected: 0 };
    }

    // Insert
    if (trimmed.toUpperCase().startsWith('INSERT')) {
      const match = trimmed.match(/INSERT (?:OR IGNORE |OR REPLACE )?INTO ([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (match && match[1] && match[2]) {
        const table = match[1];
        const cols = match[2].split(',').map(c => c.trim());
        let tableMap = this.tables.get(table);
        if (!tableMap) {
          tableMap = new Map();
          this.tables.set(table, tableMap);
        }

        const valDefs = match[3].split(',').map(v => v.trim());
        const row: any = {};
        let paramIdx = 0;
        cols.forEach((col, idx) => {
          const valDef = valDefs[idx];
          if (valDef === '?') {
            row[col] = params[paramIdx++];
          } else if (valDef) {
            if (/^'.*'$/.test(valDef)) {
              row[col] = valDef.slice(1, -1);
            } else if (!isNaN(Number(valDef))) {
              row[col] = Number(valDef);
            } else {
              row[col] = valDef;
            }
          } else {
            row[col] = params[paramIdx++];
          }
        });

        const id = row.user_id || row.turn_id || row.eval_id || row.mistake_id || row.soft_skill_id || row.metric_id || row.history_id || row.skill_id || row.session_id || params[0] || (this.autoIncrements.get(table) ?? 1);
        this.autoIncrements.set(table, (this.autoIncrements.get(table) ?? 1) + 1);
        tableMap.set(String(id), row);
        return { rows: [], rowsAffected: 1, insertId: typeof id === 'number' ? id : undefined };
      }
    }

    // Update
    if (trimmed.toUpperCase().startsWith('UPDATE')) {
      const match = trimmed.match(/UPDATE ([a-zA-Z0-9_]+)\s+SET\s+(.+?)\s+WHERE\s+([a-zA-Z0-9_]+)\s*=\s*\?/i);
      if (match && match[1]) {
        const table = match[1];
        const setClause = match[2];
        const _idCol = match[3];
        const targetId = String(params[params.length - 1]);
        const tableMap = this.tables.get(table);
        if (tableMap && tableMap.has(targetId)) {
          const row = tableMap.get(targetId);
          if (table === 'candidate_skills') {
            row.current_score = params[0];
            row.mastery_level = params[1];
            row.total_questions_asked = params[2];
            row.last_tested_at = params[3];
          } else if (table === 'mistake_diagnostics') {
            row.is_drilled = 1;
            row.drilled_score = params[0];
          } else {
            const assignments = setClause.split(',').map(s => s.trim());
            let pIdx = 0;
            for (const assignment of assignments) {
              const col = assignment.split('=')[0]?.trim();
              if (col && pIdx < params.length - 1) {
                row[col] = params[pIdx++];
              }
            }
          }
          return { rows: [], rowsAffected: 1 };
        }
      }
    }

    // Delete
    if (trimmed.toUpperCase().startsWith('DELETE')) {
      const tableMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (tableMatch && tableMatch[1]) {
        const table = tableMatch[1];
        const tableMap = this.tables.get(table);
        if (tableMap) {
          const whereMatch = trimmed.match(/WHERE\s+([a-zA-Z0-9_]+)\s*=\s*\?/i);
          if (whereMatch && whereMatch[1] && params.length > 0) {
            const col = whereMatch[1];
            const targetVal = String(params[0]);
            let deletedCount = 0;
            for (const [key, row] of tableMap.entries()) {
              if (String(row[col]) === targetVal || key === targetVal) {
                tableMap.delete(key);
                deletedCount++;
              }
            }
            return { rows: [], rowsAffected: deletedCount };
          } else {
            const count = tableMap.size;
            tableMap.clear();
            return { rows: [], rowsAffected: count };
          }
        }
      }
      return { rows: [], rowsAffected: 0 };
    }

    // Select
    if (trimmed.toUpperCase().startsWith('SELECT')) {

      const tableMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (tableMatch && tableMatch[1]) {
        const table = tableMatch[1];
        const tableMap = this.tables.get(table);
        let list = tableMap ? Array.from(tableMap.values()) : [];

        // WHERE col = ?
        const whereMatch = trimmed.match(/WHERE\s+([a-zA-Z0-9_]+)\s*=\s*\?/i);
        if (whereMatch && whereMatch[1] && params.length > 0) {
          const col = whereMatch[1];
          list = list.filter(r => String(r[col]) === String(params[0]));
        }


        // ORDER BY current_score ASC
        if (trimmed.includes('ORDER BY current_score ASC')) {
          list.sort((a, b) => (a.current_score || 0) - (b.current_score || 0));
        }
        if (trimmed.includes('ORDER BY turn_index ASC')) {
          list.sort((a, b) => (a.turn_index || 0) - (b.turn_index || 0));
        }

        // LIMIT ?
        if (trimmed.includes('LIMIT ?') && params.length > 0) {
          const limit = params[params.length - 1];
          list = list.slice(0, Number(limit));
        }

        return { rows: list, rowsAffected: list.length };
      }
    }

    return { rows: [], rowsAffected: 0 };
  }
}

export class SQLiteClient {
  private static instance: SQLiteClient | null = null;
  private nativeDb: any = null;
  private memoryDb = new InMemoryDatabaseDriver();
  private isInitialized = false;

  static getInstance(): SQLiteClient {
    if (!this.instance) {
      this.instance = new SQLiteClient();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const opSqlite = await import('@op-engineering/op-sqlite').catch(() => null);
      if (opSqlite && opSqlite.open) {
        this.nativeDb = opSqlite.open({ name: 'interview_mastery.sqlite' });
      }
    } catch (err) {
      console.warn('[SQLiteClient] op-sqlite native binding not available, using in-memory driver:', err);
    }

    // Execute database schema tables
    const statements = DATABASE_SCHEMA_SQL
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      await this.execute(stmt);
    }

    this.isInitialized = true;
  }

  async execute(sql: string, params: any[] = []): Promise<QueryResult> {
    if (this.nativeDb) {
      try {
        const res = await this.nativeDb.executeAsync(sql, params);
        return {
          rows: res.rows?._array || res.rows || [],
          rowsAffected: res.rowsAffected || 0,
          insertId: res.insertId,
        };
      } catch (err) {
        console.warn('[SQLiteClient] Error executing native SQL, falling back to memory driver:', err);
      }
    }

    return this.memoryDb.executeAsync(sql, params);
  }
}
