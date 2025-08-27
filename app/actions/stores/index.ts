'use server';

import { db } from "@/lib/drizzle";
import { stores } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { Store } from "@/types/store";
import { revalidatePath } from "next/cache";

// Re-export utility functions that could be shared across actions
export * from './create-store';
export * from './update-store';
export * from './delete-store';

export const revalidateStores = () => {
  revalidatePath(`/stores`);
};

export type GetStoresResult = {
  success: boolean;
  data?: Store[];
  error?: string;
};

export async function getStores(): Promise<GetStoresResult> {
  try {
    const session = await auth.validateSession();
    if (!session) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }

    // Get all stores for the current user
    const userStores = await db.query.stores.findMany({
      where: eq(stores.userId, session.user.id)
    });
    
    return { 
      success: true,
      data: userStores 
    };
  } catch (error: any) {
    console.error("Error fetching stores:", error);
    
    return { 
      success: false, 
      error: "Failed to fetch stores" 
    };
  }
}

export type GetStoreParams = {
  id: string;
};

export type GetStoreResult = {
  success: boolean;
  data?: Store;
  error?: string;
};

export async function getStore({ id }: GetStoreParams): Promise<GetStoreResult> {
  try {
    const session = await auth.validateSession();
    if (!session) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }

    // Get the specific store
    const store = await db.query.stores.findFirst({
      where: eq(stores.id, id)
    });
    
    if (!store) {
      return {
        success: false,
        error: "Store not found"
      };
    }
    
    // Check if store belongs to user
    if (store.userId !== session.user.id) {
      return {
        success: false,
        error: "You don't have permission to access this store"
      };
    }
    
    return { 
      success: true,
      data: store 
    };
  } catch (error: any) {
    console.error("Error fetching store:", error);
    
    return { 
      success: false, 
      error: "Failed to fetch store" 
    };
  }
}
