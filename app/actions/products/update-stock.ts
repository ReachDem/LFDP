'use server';

import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { stores } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { Product } from "@/types/store";

export type UpdateStockParams = {
  id: string;
  storeId: string;
  quantity: number; // Can be positive (add) or negative (remove)
};

export type UpdateStockResult = {
  success: boolean;
  data?: Product;
  error?: string;
};

export async function updateStock({ id, storeId, quantity }: UpdateStockParams): Promise<UpdateStockResult> {
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
    
    // Calculate new quantity
    const newQuantity = existingProduct.stockQuantity + quantity;
    
    // Prevent negative stock (unless you want to allow backorders)
    if (newQuantity < 0) {
      return {
        success: false,
        error: "Cannot reduce stock below zero"
      };
    }
    
    // Update the product stock
    const updatedProduct = await db.update(products)
      .set({
        stockQuantity: newQuantity,
        updatedAt: new Date()
      })
      .where(and(
        eq(products.id, id),
        eq(products.storeId, storeId)
      ))
      .returning();
    
    // Revalidate paths that display products
    revalidatePath(`/stores/${storeId}/products`);
    revalidatePath(`/stores/${storeId}/products/${id}`);
    
    return { 
      success: true,
      data: updatedProduct[0] 
    };
  } catch (error: any) {
    console.error("Error updating product stock:", error);
    
    return { 
      success: false, 
      error: "Failed to update product stock" 
    };
  }
}
