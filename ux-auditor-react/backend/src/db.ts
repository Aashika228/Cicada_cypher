import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "../../wayfarer.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id           TEXT PRIMARY KEY,
      url          TEXT NOT NULL,
      mode         TEXT NOT NULL,
      persona_json TEXT NOT NULL,
      language     TEXT NOT NULL,
      viewport     TEXT NOT NULL,
      status       TEXT NOT NULL,
      result_json  TEXT,
      created_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS steps (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id      TEXT NOT NULL REFERENCES audits(id),
      idx           INTEGER NOT NULL,
      screenshot    TEXT NOT NULL,
      reasoning     TEXT NOT NULL,
      action        TEXT NOT NULL,
      friction_json TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );
  `);
}
