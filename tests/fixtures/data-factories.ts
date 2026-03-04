/**
 * Data Factories
 * 
 * Test data generation using Faker and composition patterns
 * Provides deterministic, parallel-safe test data
 */

import { faker } from '@faker-js/faker';

// Utility for creating unique, sequential data
let userCount = 0;
let productCount = 0;
let categoryCount = 0;

/**
 * User data factory with overrides
 */
export const userDataFactory = (overrides: Partial<any> = {}) => {
  userCount++;
  const base = {
    id: `user-${userCount}-${Date.now()}`,
    email: `test-user-${userCount}-${Date.now()}@example.com`,
    name: faker.person.fullName(),
    password: 'Test123!@#',
    created_at: new Date().toISOString()
  };
  
  return { ...base, ...overrides };
};

/**
 * Admin user data factory
 */
export const adminUserFactory = (overrides: Partial<any> = {}) => {
  userCount++;
  const base = {
    id: `admin-${userCount}-${Date.now()}`,
    email: process.env.TEST_ADMIN_EMAIL || `admin-${userCount}@dresscave.com`,
    name: 'Admin User',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin-password',
    role: 'admin',
    created_at: new Date().toISOString()
  };
  
  return { ...base, ...overrides };
};

/**
 * Product data factory with variants
 */
export const productDataFactory = (overrides: Partial<any> = {}) => {
  productCount++;
  const base = {
    id: `prod-${productCount}-${Date.now()}`,
    name: faker.commerce.productName(),
    slug: faker.helpers.slugify(faker.commerce.productName() + `-${productCount}`),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    category: faker.helpers.arrayElement(['women', 'men', 'kids', 'accessories']),
    images: [`https://res.cloudinary.com/dresscave/image/upload/v1/products/${productCount}/main.jpg`],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return { ...base, ...overrides };
};

/**
 * Category data factory
 */
export const categoryDataFactory = (overrides: Partial<any> = {}) => {
  categoryCount++;
  const base = {
    id: `cat-${categoryCount}-${Date.now()}`,
    name: faker.commerce.department(),
    slug: faker.helpers.slugify(faker.commerce.department() + `-${categoryCount}`),
    description: faker.lorem.sentence(),
    image: `https://res.cloudinary.com/dresscave/image/upload/v1/categories/${categoryCount}/main.jpg`,
    created_at: new Date().toISOString()
  };
  
  return { ...base, ...overrides };
};

/**
 * Variant data factory
 */
export const variantDataFactory = (productId: string, overrides: Partial<any> = []) => {
  const colors = ['red', 'blue', 'green', 'black', 'white'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  const variants = Array.isArray(overrides) ? overrides : [overrides];
  
  return variants.map((v, i) => ({
    id: `variant-${productId}-${i + 1}`,
    product_id: productId,
    color: faker.helpers.arrayElement(colors),
    size: faker.helpers.arrayElement(sizes),
    stock: faker.number.int({ min: 0, max: 100 }),
    price_adjustment: faker.number.int({ min: 0, max: 50 }),
    sku: `SKU-${productId}-${i + 1}`,
    created_at: new Date().toISOString()
  }));
};

/**
 * Measurement data factory for custom sizing
 */
export const measurementDataFactory = (overrides: Partial<any> = {}) => {
  const base = {
    length: `${faker.number.int({ min: 20, max: 50 })} inches`,
    chest: `${faker.number.int({ min: 30, max: 60 })} inches`,
    waist: `${faker.number.int({ min: 24, max: 50 })} inches`,
    hips: `${faker.number.int({ min: 34, max: 65 })} inches`,
    shoulder: `${faker.number.int({ min: 12, max: 20 })} inches`,
    sleeve: `${faker.number.int({ min: 8, max: 15 })} inches`
  };
  
  return { ...base, ...overrides };
};

/**
 * Review data factory
 */
export const reviewDataFactory = (productId: string, userId: string, overrides: Partial<any> = {}) => {
  const base = {
    id: `review-${Date.now()}-${Math.random()}`,
    product_id: productId,
    user_id: userId,
    rating: faker.number.int({ min: 1, max: 5 }),
    title: faker.lorem.sentence(),
    text: faker.lorem.paragraphs(2),
    verified_purchase: faker.datatype.boolean(),
    created_at: new Date().toISOString()
  };
  
  return { ...base, ...overrides };
};

/**
 * Wishlist item factory
 */
export const wishlistItemFactory = (userId: string, productId: string, overrides: Partial<any> = {}) => {
  const base = {
    id: `wishlist-${Date.now()}-${Math.random()}`,
    user_id: userId,
    product_id: productId,
    created_at: new Date().toISOString()
  };
  
  return { ...base, ...overrides };
};

/**
 * Cart item factory
 */
export const cartItemFactory = (userId: string, productId: string, overrides: Partial<any> = {}) => {
  const base = {
    id: `cart-${Date.now()}-${Math.random()}`,
    user_id: userId,
    product_id: productId,
    variant_id: `variant-${productId}-1`,
    quantity: faker.number.int({ min: 1, max: 5 }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return { ...base, ...overrides };
};

/**
 * Composition: Create a complete product with variants
 */
export const createProductWithVariants = (variantCount = 3) => {
  const product = productDataFactory();
  const variants = variantDataFactory(product.id, Array(variantCount).fill({}));
  
  return {
    product,
    variants
  };
};

/**
 * Composition: Create a complete category with products
 */
export const createCategoryWithProducts = (productCount = 5) => {
  const category = categoryDataFactory();
  const products = Array(productCount).fill(null).map(() => {
    const product = productDataFactory({ category: category.slug });
    return {
      product,
      variants: variantDataFactory(product.id, [{ color: 'blue', size: 'M' }])
    };
  });
  
  return {
    category,
    products
  };
};

/**
 * Reset counters for deterministic test data
 */
export const resetDataCounters = () => {
  userCount = 0;
  productCount = 0;
  categoryCount = 0;
};
