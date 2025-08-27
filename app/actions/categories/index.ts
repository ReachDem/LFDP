'use server';

import { db } from "@/lib/drizzle";
import { categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { stores } from "@/db/schema";
import { Category } from "@/types/store";
import { revalidatePath } from "next/cache";

// Re-export utility functions that could be shared across actions
export * from './create-category';
export * from './update-category';
export * from './delete-category';

export const revalidateCategories = (storeId: string) => {
  revalidatePath(`/stores/${storeId}/categories`);
};

export type GetCategoriesParams = {
  storeId: string;
};

export type GetCategoriesResult = {
  success: boolean;
  data?: Category[];
  error?: string;
};

export async function getCategories({ storeId }: GetCategoriesParams): Promise<GetCategoriesResult> {
  try {
    const session = await auth.validateSession();
    if (!session) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }

    // Verify the store exists and belongs to the user
    const store = await db.query.stores.findFirst({
      where: and(
        eq(stores.id, storeId),
        eq(stores.userId, session.user.id)
      )
    });
    
    if (!store) {
      return { 
        success: false, 
        error: "Store not found or you don't have permission" 
      };
    }
    
    // Get all categories for the store
    const storeCategories = await db.query.categories.findMany({
      where: eq(categories.storeId, storeId)
    });
    
    return { 
      success: true,
      data: storeCategories 
    };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    
    return { 
      success: false, 
      error: "Failed to fetch categories" 
    };
  }
}

export type GetCategoryParams = {
  id: string;
  storeId: string;
};

export type GetCategoryResult = {
  success: boolean;
  data?: Category;
  error?: string;
};

export async function getCategory({ id, storeId }: GetCategoryParams): Promise<GetCategoryResult> {
  try {
    const session = await auth.validateSession();
    if (!session) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }

    // Verify the store exists and belongs to the user
    const store = await db.query.stores.findFirst({
      where: and(
        eq(stores.id, storeId),
        eq(stores.userId, session.user.id)
      )
    });
    
    if (!store) {
      return { 
        success: false, 
        error: "Store not found or you don't have permission" 
      };
    }
    
    // Get the specific category
    const category = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, id),
        eq(categories.storeId, storeId)
      )
    });
    
    if (!category) {
      return {
        success: false,
        error: "Category not found"
      };
    }
    
    return { 
      success: true,
      data: category 
    };
  } catch (error: any) {
    console.error("Error fetching category:", error);
    
    return { 
      success: false, 
      error: "Failed to fetch category" 
    };
  }
}