import { z } from 'zod';

export const createUser = z.object({
  email: z.string().email(),
  last_name: z.string().nullable().default(null),
  first_name: z.string().nullable().default(null),
  profile_image: z.string().nullable().default(null)
});

export const user = createUser.extend({
  user_id: z.number().positive()
});

/**
 *
 * @param {import('better-sqlite3').Database} db
 * @returns
 */
export const sql = (db) => {
  db.exec(`CREATE TABLE IF NOT EXISTS "users" (
    "user_id"	INTEGER,
    "email"	TEXT NOT NULL UNIQUE,
    "last_name"	TEXT DEFAULT NULL,
    "first_name"	TEXT DEFAULT NULL,
    "profile_image"	TEXT DEFAULT NULL,
    PRIMARY KEY("user_id" AUTOINCREMENT)
  );`);
  return {
    insert: db.prepare(`INSERT INTO "users" (email, last_name, first_name, profile_image) VALUES
    (@email, @last_name, @first_name, @profile_image);`),
    update:
      db.prepare(`UPDATE "users" SET email=@email, last_name=@last_name, first_name=@first_name,
    profile_image=@profile_image where user_id=@user_id`),
    get: {
      by: {
        email: db.prepare(`SELECT * FROM "users" WHERE email=@email LIMIT 1`),
        user_id: db.prepare(`SELECT * FROM "users" WHERE user_id=@user_id LIMIT 1`),
        last_name: db.prepare(`SELECT * FROM "users" WHERE last_name=@last_name`),
        first_name: db.prepare(`SELECT * FROM "users" WHERE first_name=@first_name`),
        full_name: db.prepare(
          `SELECT * FROM "users" WHERE first_name=@first_name AND last_name=@last_name`
        )
      }
    }
  };
};
