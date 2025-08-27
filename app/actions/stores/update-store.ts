'use server';

import { db } from "@/lib/drizzle";
import { stores } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Store } from "@/types/store";

export type UpdateStoreFormData = {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
  bannerImage?: string;
  address?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  isActive?: boolean;
};

export type UpdateStoreResult = {
  success: boolean;
  data?: Store;
  error?: string;
};

export async function updateStore(formData: UpdateStoreFormData): Promise<UpdateStoreResult> {
  try {
    const session = await auth.validateSession();
    if (!session) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }

    const { id, ...updateData } = formData;
    
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
        error: "You don't have permission to update this store"
      };
    }
    
    // Update the store
    const updatedStore = await db.update(stores)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(stores.id, id))
      .returning();
    
    // Revalidate paths that display stores
    revalidatePath(`/stores`);
    revalidatePath(`/stores/${id}`);
    
    return { 
      success: true,
      data: updatedStore[0] 
    };
  } catch (error: any) {
    console.error("Error updating store:", error);
    
    return { 
      success: false, 
      error: "Failed to update store" 
    };
  }
}
