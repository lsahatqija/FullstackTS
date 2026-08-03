import { relations } from 'drizzle-orm';
import { index, integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 120 }).notNull(),
    role: userRoleEnum('role').notNull().default('user'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex('users_email_unique_idx').on(table.email),
  }),
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => ({
    tokenHashUniqueIdx: uniqueIndex('sessions_token_hash_unique_idx').on(table.tokenHash),
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
  }),
);

export const files = pgTable(
  'files',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storageKey: varchar('storage_key', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    size: integer('size').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    storageKeyUniqueIdx: uniqueIndex('files_storage_key_unique_idx').on(table.storageKey),
    ownerIdIdx: index('files_owner_id_idx').on(table.ownerId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  files: many(files),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  owner: one(users, { fields: [files.ownerId], references: [users.id] }),
}));
