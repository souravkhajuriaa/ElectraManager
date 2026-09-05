import { Product } from '@/src/types';

const STORAGE_KEY_CUSTOM_IMAGES = 'electra_custom_product_images';
const STORAGE_KEY_MASTER_PRODUCTS = 'electra_master_products';

/**
 * Safely retrieve custom product images map from localStorage
 */
export function getCustomProductImages(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_IMAGES);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.warn('[imageStorage] Failed to read custom images from localStorage', err);
    return {};
  }
}

/**
 * Save a custom product image by ID, SKU, and clean Name
 */
export function saveCustomProductImage(productId: string, sku?: string, name?: string, imageUrl?: string): void {
  if (typeof window === 'undefined' || !imageUrl) return;
  try {
    const current = getCustomProductImages();
    if (productId) current[productId] = imageUrl;
    if (sku) current[sku.trim().toUpperCase()] = imageUrl;
    if (name) current[`name_${name.trim().toLowerCase()}`] = imageUrl;

    localStorage.setItem(STORAGE_KEY_CUSTOM_IMAGES, JSON.stringify(current));
  } catch (err) {
    console.warn('[imageStorage] Failed to save custom product image to localStorage', err);
  }
}

/**
 * Apply saved custom product images to any product array
 */
export function applyCustomImagesToProducts(products: Product[]): Product[] {
  if (!Array.isArray(products) || products.length === 0) return products;
  const customImages = getCustomProductImages();
  if (Object.keys(customImages).length === 0) return products;

  return products.map(product => {
    const customImg =
      customImages[product.id] ||
      (product.sku ? customImages[product.sku.trim().toUpperCase()] : undefined) ||
      (product.name ? customImages[`name_${product.name.trim().toLowerCase()}`] : undefined);

    if (customImg && customImg !== product.imageUrl) {
      return { ...product, imageUrl: customImg };
    }
    return product;
  });
}

/**
 * Save master products catalog to ensure durability across all accounts and restarts
 */
export function saveMasterProducts(products: Product[]): void {
  if (typeof window === 'undefined' || !Array.isArray(products)) return;
  try {
    // Also save custom images mapping for every product with an image
    const customMap = getCustomProductImages();
    let hasNewCustom = false;
    products.forEach(p => {
      if (p.imageUrl) {
        if (p.id) customMap[p.id] = p.imageUrl;
        if (p.sku) customMap[p.sku.trim().toUpperCase()] = p.imageUrl;
        if (p.name) customMap[`name_${p.name.trim().toLowerCase()}`] = p.imageUrl;
        hasNewCustom = true;
      }
    });
    if (hasNewCustom) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_IMAGES, JSON.stringify(customMap));
    }
    localStorage.setItem(STORAGE_KEY_MASTER_PRODUCTS, JSON.stringify(products));
    localStorage.setItem('electra_products', JSON.stringify(products));
  } catch (err) {
    console.warn('[imageStorage] Failed to save master products', err);
  }
}

/**
 * Load master products if available, with custom images merged
 */
export function getMasterProducts(fallbackProducts: Product[]): Product[] {
  if (typeof window === 'undefined') return fallbackProducts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MASTER_PRODUCTS) || localStorage.getItem('electra_products');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return applyCustomImagesToProducts(parsed);
      }
    }
  } catch (err) {
    console.warn('[imageStorage] Failed to load master products', err);
  }
  return applyCustomImagesToProducts(fallbackProducts);
}

/**
 * Compress and optimize an image file to a lightweight Base64 data URL
 * (target size: ~30-60KB, max dimension 640px) to prevent localStorage quota exhaustion.
 */
export function compressImageFile(file: File, maxWidth = 640, maxHeight = 480, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw with high smoothing quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          const fallbackDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(fallbackDataUrl);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
