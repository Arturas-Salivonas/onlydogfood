import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate specific paths after admin updates
export async function revalidateAfterUpdate(paths: string[] = []) {
  try {
    // Revalidate specific paths
    for (const path of paths) {
      revalidatePath(path);
    }

    // Revalidate common tags
    revalidateTag('products', 'page');
    revalidateTag('brands', 'page');
    revalidateTag('categories', 'page');

    console.log('Revalidation completed for paths:', paths);
  } catch (error) {
    console.error('Revalidation failed:', error);
    throw error;
  }
}

// Revalidate product-related pages
export async function revalidateProducts(productIds?: string[]) {
  const paths = ['/dog-food'];

  // Add specific product pages if IDs provided
  if (productIds) {
    for (const id of productIds) {
      paths.push(`/dog-food/${id}`);
    }
  }

  await revalidateAfterUpdate(paths);
}

// Revalidate brand-related pages
export async function revalidateBrands(brandIds?: string[]) {
  const paths = ['/brands'];

  // Add specific brand pages if IDs provided
  if (brandIds) {
    for (const id of brandIds) {
      paths.push(`/brands/${id}`);
    }
  }

  await revalidateAfterUpdate(paths);
}

// Revalidate everything (use sparingly)
export async function revalidateAll() {
  await revalidateAfterUpdate([
    '/',
    '/dog-food',
    '/brands',
    '/compare',
    '/methodology',
    '/about',
  ]);
}