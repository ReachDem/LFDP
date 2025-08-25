// Export all authentication tables
export * from './auth-schema';

// You can add your application-specific tables here
// For example:
// export const posts = pgTable('posts', {
//   id: text('id').primaryKey(),
//   title: text('title').notNull(),
//   content: text('content'),
//   authorId: text('author_id').references(() => user.id),
//   createdAt: timestamp('created_at').$defaultFn(() => new Date()),
// });