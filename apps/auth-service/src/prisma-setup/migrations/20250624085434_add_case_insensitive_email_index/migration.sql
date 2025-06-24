CREATE UNIQUE INDEX IF NOT EXISTS "unique_email_case_insensitive" ON "users"(LOWER("email"));
