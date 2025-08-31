import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { stores, categories, products } from "@/db/schema";

// Store types
export type Store = InferSelectModel<typeof stores>;
export type NewStore = InferInsertModel<typeof stores>;

// Category types
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

// Product types
export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;