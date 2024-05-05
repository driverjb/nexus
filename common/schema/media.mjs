import { z } from 'zod';

export const entry = z.object({
  entry_id: z.number().positive(),
  file_name: z.string()
});

/**
 *
 * @param {import('better-sqlite3').Database} db
 * @returns
 */
export const sql = (db) => {
  db.exec(`CREATE TABLE IF NOT EXISTS "media" (
    "entry_id" INTEGER,
    "file_name" TEXT UNIQUE NOT NULL,
    PRIMARY KEY("entry_id" AUTOINCREMENT)
  );`);
  return {
    insert: db.prepare(`INSERT INTO "media" (file_name) VALUES (@file_name);`),
    get: {
      by: {
        entry_id: db.prepare(`SELECT * FROM "media" WHERE entry_id=@entry_id LIMIT 1`),
        file_name: db.prepare(`SELECT * FROM "media" WHERE file_name=@file_name LIMIT 1`)
      },
      all: db.prepare('SELECT * from "media"')
    }
  };
};
