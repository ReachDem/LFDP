'use server';

import { db } from "@/lib/drizzle";
import { products, categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { stores } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { Product } from "@/types/store";

export type CreateProductFormData = {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  alertThreshold?: number;
  categoryId?: string;
  imageUrl?: string;
  storeId: string;
  isPublished?: boolean;
};

export type CreateProductResult = {
  success: boolean;
  data?: Product;
  error?: string;
};

export async function createProduct(formData: CreateProductFormData): Promise<CreateProductResult> {
  try {
    const session = await auth.validateSession();
    if (!session) {
      return { 
        success: false, 
        error: "Unauthorized. Please sign in." 
      };
    }

    const { 
      name, 
      description, 
      price, 
      stockQuantity, 
      alertThreshold = 10, 
      categoryId, 
      imageUrl,
      storeId,
      isPublished = true
    } = formData;
    
    if (!name || price === undefined || stockQuantity === undefined) {
      return { 
        success: false, 
        error: "Name, price, and stock quantity are required" 
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
    
    // If categoryId is provided, verify it belongs to the store
    if (categoryId) {
      const category = await db.query.categories.findFirst({
        where: and(
          eq(categories.id, categoryId),
          eq(categories.storeId, storeId)
        )
      });
      
      if (!category) {
        return { 
          success: false, 
          error: "Invalid category" 
        };
      }
    }
    
    // Create the product
    const newProduct = await db.insert(products)
      .values({
        name,
        description,
        price,
        stockQuantity,
        alertThreshold,
        categoryId,
        imageUrl,
        storeId,
        isPublished
      })
      .returning();
    
    // Revalidate paths that display products
    revalidatePath(`/stores/${storeId}/products`);
    if (categoryId) {
      revalidatePath(`/stores/${storeId}/categories/${categoryId}`);
    }
    
    return { 
      success: true,
      data: newProduct[0] 
    };
  } catch (error: any) {
    console.error("Error creating product:", error);
    
    return { 
      success: false, 
      error: "Failed to create product" 
    };
  }
}
