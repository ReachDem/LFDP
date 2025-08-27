'use server';

import { db } from "@/lib/drizzle";
import { categories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { stores } from "@/db/schema";
import { headers } from "next/headers";
import { Category } from "@/types/store";

export type CreateCategoryFormData = {
  name: string;
  storeId: string;
};

export type CreateCategoryResult = {
  success: boolean;
  data?: Category;
  error?: string;
};

export async function createCategory(formData: CreateCategoryFormData): Promise<CreateCategoryResult> {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!sessionData) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }
    
    // Cast the session to the expected type
    const session = sessionData as { user: { id: string } };

    const { name, storeId } = formData;
    
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
    
    // Create the category
    const newCategory = await db.insert(categories)
      .values({
        name,
        storeId
      })
      .returning();
    
    // Revalidate paths that display categories
    revalidatePath(`/stores/${storeId}/categories`);
    revalidatePath(`/stores/${storeId}/products`); // Products might display category names
    
    return { 
      success: true,
      data: newCategory[0] 
    };
  } catch (error: any) {
    console.error("Error creating category:", error);
    
    // Handle specific error cases
    if (error.message?.includes('unique constraint')) {
      return {
        success: false,
        error: "A category with this name already exists in this store"
      };
    }
    
    return { 
      success: false, 
      error: "Failed to create category" 
    };
  }
}
