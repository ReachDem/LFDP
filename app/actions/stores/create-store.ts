'use server';

import { db } from "@/lib/drizzle";
import { stores } from "@/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Store } from "@/types/store";

export type CreateStoreFormData = {
  name: string;
  description?: string;
  logo?: string;
  bannerImage?: string;
  address?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
};

export type CreateStoreResult = {
  success: boolean;
  data?: Store;
  error?: string;
};

export async function createStore(formData: CreateStoreFormData): Promise<CreateStoreResult> {
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

    const { name, description, logo, bannerImage, address, phone, email, websiteUrl } = formData;
    
    if (!name) {
      return { 
        success: false, 
        error: "Store name is required" 
      };
    }
    
    // Create the store
    const newStore = await db.insert(stores)
      .values({
        name,
        description,
        logo,
        bannerImage,
        address,
        phone,
        email,
        websiteUrl,
        userId: session.user.id,
        isActive: true
      })
      .returning();
    
    // Revalidate paths that display stores
    revalidatePath(`/stores`);
    
    return { 
      success: true,
      data: newStore[0] 
    };
  } catch (error: any) {
    console.error("Error creating store:", error);
    
    return { 
      success: false, 
      error: "Failed to create store" 
    };
  }
}
