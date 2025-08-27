'use server';

import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { stores } from "@/db/schema";
import { Category } from "@/types/store";

export type UpdateCategoryFormData = {
  id: string;
  name: string;
  storeId: string;
};

export type UpdateCategoryResult = {
  success: boolean;
  data?: Category;
  error?: string;
};

export async function updateCategory(formData: UpdateCategoryFormData): Promise<UpdateCategoryResult> {
  try {
    const session = await auth.validateSession();
    if (!session) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }

    const { id, name, storeId } = formData;
    
    if (!name) {
      return { 
        success: false, 
        error: "Category name is required" 
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
    
    // Update the category
    const updatedCategory = await db.update(categories)
      .set({ name })
      .where(and(
        eq(categories.id, id),
        eq(categories.storeId, storeId)
      ))
      .returning();
    
    // Revalidate paths that display categories
    revalidatePath(`/stores/${storeId}/categories`);
    revalidatePath(`/stores/${storeId}/categories/${id}`);
    revalidatePath(`/stores/${storeId}/products`);
    
    return { 
      success: true,
      data: updatedCategory[0] 
    };
  } catch (error: any) {
    console.error("Error updating category:", error);
    
    // Handle specific error cases
    if (error.message?.includes('unique constraint')) {
      return {
        success: false,
        error: "A category with this name already exists in this store"
      };
    }
    
    return { 
      success: false, 
      error: "Failed to update category" 
    };
  }
}
