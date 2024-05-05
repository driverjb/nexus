import { z } from 'zod';

export const security = z.object({
  user_id: z.number().positive(),
  salt: z.string().nullable().default(null),
  hash: z.string().nullable().default(null),
  reset: z.string().nullable().default(null)
});

/**
 *
 * @param {import('better-sqlite3').Database} db
 * @returns
 */

export const sql = (db) => {
  db.exec(`CREATE TABLE IF NOT EXISTS "security" (
    "user_id"	INTEGER,
    "salt" TEXT DEFAULT NULL,
    "hash" TEXT DEFAULT NULL,
    "reset" TEXT DEFAULT NULL,
    PRIMARY KEY("user_id"),
    FOREIGN KEY("user_id") REFERENCES "users"("user_id")
  );`);
  return {
    insert: db.prepare(`INSERT INTO "security" (user_id, salt, hash, reset) VALUES
    (@user_id, @salt, @hash, @reset);`),
    update: db.prepare(
      `UPDATE "security" SET salt=@salt, hash=@hash, reset=@reset WHERE user_id=@user_id`
    ),
    get: {
      by: {
        user_id: db.prepare(`SELECT * FROM "security" WHERE user_id=@user_id`),
        reset: db.prepare(`SELECT * FROM "security" WHERE reset=@reset`)
      }
    }
  };
};
