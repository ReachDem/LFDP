import { pgTable, uuid, text, integer, decimal, timestamp, foreignKey, unique, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

// Stores table - chaque utilisateur peut avoir plusieurs boutiques
export const stores = pgTable("stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  bannerImage: text("banner_image"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  websiteUrl: text("website_url"),
  isActive: boolean("is_active").default(true).notNull(),
  userId: text("user_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table - maintenant liées à une boutique
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  storeId: uuid("store_id").notNull().references(() => stores.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Composite unique constraint for name + storeId
  // This allows different stores to have categories with the same name
}, (table) => {
  return {
    storeNameUnique: unique().on(table.storeId, table.name),
  };
});

// Products table - maintenant liés à une boutique
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull(),
  alertThreshold: integer("alert_threshold").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  imageUrl: text("image_url"),
  storeId: uuid("store_id").notNull().references(() => stores.id),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const storesRelations = relations(stores, ({ many, one }) => ({
  categories: many(categories),
  products: many(products),
  user: one(user, {
    fields: [stores.userId],
    references: [user.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  store: one(stores, {
    fields: [categories.storeId],
    references: [stores.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
}));