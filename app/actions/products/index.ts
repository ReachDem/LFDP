'use server';

import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq, sql } from "drizzle-orm";
import { stores } from "@/db/schema";
import { Product } from "@/types/store";
import { revalidatePath } from "next/cache";

// Re-export utility functions that could be shared across actions
export * from './create-product';
export * from './update-product';
export * from './delete-product';
export * from './update-stock';

export const revalidateProducts = (storeId: string) => {
  revalidatePath(`/stores/${storeId}/products`);
};

export type GetProductsParams = {
  storeId: string;
  categoryId?: string;
};

export type GetProductsResult = {
  success: boolean;
  data?: Product[];
  error?: string;
};

export async function getProducts({ storeId, categoryId }: GetProductsParams): Promise<GetProductsResult> {
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
    
    // Get products for the store, optionally filtered by category
    let whereClause;
    
    if (categoryId) {
      whereClause = and(
        eq(products.storeId, storeId),
        eq(products.categoryId, categoryId)
      );
    } else {
      whereClause = eq(products.storeId, storeId);
    }
    
    const storeProducts = await db.query.products.findMany({
      where: whereClause,
      with: {
        category: true
      }
    });
    
    return { 
      success: true,
      data: storeProducts 
    };
  } catch (error: any) {
    console.error("Error fetching products:", error);
    
    return { 
      success: false, 
      error: "Failed to fetch products" 
    };
  }
}

export type GetProductParams = {
  id: string;
  storeId: string;
};

export type GetProductResult = {
  success: boolean;
  data?: Product;
  error?: string;
};

export async function getProduct({ id, storeId }: GetProductParams): Promise<GetProductResult> {
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
    
    // Get the specific product
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, id),
        eq(products.storeId, storeId)
      ),
      with: {
        category: true
      }
    });
    
    if (!product) {
      return {
        success: false,
        error: "Product not found"
      };
    }
    
    return { 
      success: true,
      data: product 
    };
  } catch (error: any) {
    console.error("Error fetching product:", error);
    
    return { 
      success: false, 
      error: "Failed to fetch product" 
    };
  }
}

export type GetLowStockProductsParams = {
  storeId: string;
};

export type GetLowStockProductsResult = {
  success: boolean;
  data?: Product[];
  error?: string;
};

export async function getLowStockProducts({ storeId }: GetLowStockProductsParams): Promise<GetLowStockProductsResult> {
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
    
    // Find products where stock quantity is below alert threshold
    const lowStockProducts = await db.query.products.findMany({
      where: and(
        eq(products.storeId, storeId),
        // We use raw SQL for the comparison because Drizzle doesn't directly support this
        // in the type-safe query builder
        sql`${products.stockQuantity} <= ${products.alertThreshold}`
      ),
      with: {
        category: true
      }
    });
    
    return { 
      success: true,
      data: lowStockProducts 
    };
  } catch (error: any) {
    console.error("Error fetching low stock products:", error);
    
    return { 
      success: false, 
      error: "Failed to fetch low stock products" 
    };
  }
}
