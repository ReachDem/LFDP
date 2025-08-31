'use server';

import { db } from "@/lib/drizzle";
import { stores, categories, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type DeleteStoreParams = {
  id: string;
};

export type DeleteStoreResult = {
  success: boolean;
  error?: string;
};

export async function deleteStore({ id }: DeleteStoreParams): Promise<DeleteStoreResult> {
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

    // Verify the store exists and belongs to the user
    const existingStore = await db.query.stores.findFirst({
      where: eq(stores.id, id)
    });
    
    if (!existingStore) {
      return {
        success: false,
        error: "Store not found"
      };
    }
    
    // Check if store belongs to user
    if (existingStore.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to delete this store"
      };
    }
    
    // In a production environment, you might want to:
    // 1. Check if there are orders associated with this store
    // 2. Perform a soft delete instead of permanently deleting
    
    // For now, let's delete associated products and categories first
    await db.delete(products)
      .where(eq(products.storeId, id));
    
    await db.delete(categories)
      .where(eq(categories.storeId, id));
    
    // Delete the store
    await db.delete(stores)
      .where(eq(stores.id, id));
    
    // Revalidate paths that display stores
    revalidatePath(`/stores`);
    
    return { 
      success: true
    };
  } catch (error: any) {
    console.error("Error deleting store:", error);
    
    return { 
      success: false, 
      error: "Failed to delete store" 
    };
  }
}
