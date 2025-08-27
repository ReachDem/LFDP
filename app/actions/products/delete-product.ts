'use server';

import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { stores } from "@/db/schema";
import { revalidatePath } from "next/cache";

export type DeleteProductParams = {
  id: string;
  storeId: string;
};

export type DeleteProductResult = {
  success: boolean;
  error?: string;
};

export async function deleteProduct({ id, storeId }: DeleteProductParams): Promise<DeleteProductResult> {
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
    
    // Verify the product exists and belongs to the store
    const existingProduct = await db.query.products.findFirst({
      where: and(
        eq(products.id, id),
        eq(products.storeId, storeId)
      )
    });
    
    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found"
      };
    }
    
    // In a production environment, you might want to:
    // 1. Check if there are orders containing this product
    // 2. Perform a soft delete instead of permanently deleting
    
    // Delete the product
    await db.delete(products)
      .where(and(
        eq(products.id, id),
        eq(products.storeId, storeId)
      ));
    
    // Revalidate paths that display products
    revalidatePath(`/stores/${storeId}/products`);
    if (existingProduct.categoryId) {
      revalidatePath(`/stores/${storeId}/categories/${existingProduct.categoryId}`);
    }
    
    return { 
      success: true
    };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    
    return { 
      success: false, 
      error: "Failed to delete product" 
    };
  }
}
