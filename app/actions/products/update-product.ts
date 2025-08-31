'use server';

import { db } from "@/lib/drizzle";
import { products, categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { stores } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Product } from "@/types/store";

export type UpdateProductFormData = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  alertThreshold?: number;
  categoryId?: string | null;
  imageUrl?: string | null;
  storeId: string;
  isPublished?: boolean;
};

export type UpdateProductResult = {
  success: boolean;
  data?: Product;
  error?: string;
};

export async function updateProduct(formData: UpdateProductFormData): Promise<UpdateProductResult> {
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

    const { 
      id,
      storeId,
      ...updateData
    } = formData;
    
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
    
    // If categoryId is provided, verify it belongs to the store
    if (updateData.categoryId) {
      const category = await db.query.categories.findFirst({
        where: and(
          eq(categories.id, updateData.categoryId),
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
    
    // Update the product
    const updatedProduct = await db.update(products)
      .set({
        ...(updateData.name !== undefined ? { name: updateData.name } : {}),
        ...(updateData.description !== undefined ? { description: updateData.description } : {}),
        ...(updateData.price !== undefined ? { price: updateData.price.toString() } : {}),
        ...(updateData.stockQuantity !== undefined ? { stockQuantity: updateData.stockQuantity } : {}),
        ...(updateData.alertThreshold !== undefined ? { alertThreshold: updateData.alertThreshold } : {}),
        ...(updateData.categoryId !== undefined ? { categoryId: updateData.categoryId } : {}),
        ...(updateData.imageUrl !== undefined ? { imageUrl: updateData.imageUrl } : {}),
        ...(updateData.isPublished !== undefined ? { isPublished: updateData.isPublished } : {}),
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
    
    // Revalidate category pages if category has changed
    if (existingProduct.categoryId !== updateData.categoryId) {
      if (existingProduct.categoryId) {
        revalidatePath(`/stores/${storeId}/categories/${existingProduct.categoryId}`);
      }
      if (updateData.categoryId) {
        revalidatePath(`/stores/${storeId}/categories/${updateData.categoryId}`);
      }
    }
    
    return { 
      success: true,
      data: updatedProduct[0] 
    };
  } catch (error: any) {
    console.error("Error updating product:", error);
    
    return { 
      success: false, 
      error: "Failed to update product" 
    };
  }
}
