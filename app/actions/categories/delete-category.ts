'use server';

import { db } from "@/lib/drizzle";
import { categories, products } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { stores } from "@/db/schema";

export type DeleteCategoryParams = {
  id: string;
  storeId: string;
};

export type DeleteCategoryResult = {
  success: boolean;
  error?: string;
};

export async function deleteCategory(params: DeleteCategoryParams): Promise<DeleteCategoryResult> {
  try {
    const session = await auth.validateSession();
    if (!session) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }

    const { id, storeId } = params;
    
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
    
    // Verify the category exists and belongs to the store
    const existingCategory = await db.query.categories.findFirst({
      where: and(
        eq(categories.id, id),
        eq(categories.storeId, storeId)
      )
    });
    
    if (!existingCategory) {
      return {
        success: false,
        error: "Category not found"
      };
    }
    
    // Check if there are products using this category
    const productsWithCategory = await db.query.products.findFirst({
      where: eq(products.categoryId, id)
    });
    
    if (productsWithCategory) {
      return {
        success: false,
        error: "Cannot delete category because it contains products"
      };
    }
    
    // Delete the category
    await db.delete(categories)
      .where(and(
        eq(categories.id, id),
        eq(categories.storeId, storeId)
      ));
    
    // Revalidate paths that display categories
    revalidatePath(`/stores/${storeId}/categories`);
    
    return { 
      success: true 
    };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    
    return { 
      success: false, 
      error: "Failed to delete category" 
    };
  }
}
