export interface CustomizationOption {
  id: string;
  groupId: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  isAvailable: boolean;
  displayOrder: number;
}

export interface CustomizationGroup {
  id: string;
  productId: string;
  name: string;
  type: 'SINGLE' | 'MULTIPLE';
  required: boolean;
  minSelections: number;
  maxSelections: number;
  displayOrder: number;
  options: CustomizationOption[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder: number;
  active: boolean;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  categoryId: string;
  category?: Category;
  basePrice: number;
  discountedPrice?: number | null;
  isVeg: boolean;
  isBestseller: boolean;
  isNew: boolean;
  isRecommended: boolean;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  displayOrder: number;
  customizationGroups?: CustomizationGroup[];
}

export interface SelectedOptionSnapshot {
  groupName: string;
  optionId: string;
  optionName: string;
  priceModifier: number;
}

export interface CartItem {
  id: string; // unique cart entry key (productId + sorted option IDs)
  product: Product;
  quantity: number;
  selectedOptions: SelectedOptionSnapshot[];
  unitPrice: number; // base price + options price
  notes?: string;
}

export interface CafeTable {
  id: string;
  number: string;
  name: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
  notes?: string;
  active?: boolean;
  activeOrdersCount?: number;
  currentBillTotal?: number;
  orders?: Order[];
}

export interface OrderItemCustomization {
  id: string;
  groupName: string;
  optionName: string;
  priceModifier: number;
}

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  categoryName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  isVeg: boolean;
  customizations?: OrderItemCustomization[];
}

export type OrderStatus =
  | 'ORDER_RECEIVED'
  | 'ORDER_ACCEPTED'
  | 'PREPARING'
  | 'READY_TO_SERVE'
  | 'SERVED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  status: OrderStatus;
  customerName: string;
  customerPhone?: string | null;
  tableId?: string | null;
  tableNumber?: string | null;
  table?: CafeTable;
  subtotal: number;
  discount: number;
  taxAmount: number;
  serviceCharge: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  specialInstructions?: string | null;
  cancellationReason?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  id: number;
  cafeName: string;
  tagline: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroImage: string;
  announcementBanner: string;
  showAnnouncement: boolean;
  primaryColor: string;
  accentColor: string;
  darkModeEnabled: boolean;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  googleMapsEmbedUrl?: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  currencySymbol: string;
  taxRatePercent: number;
  serviceChargePercent: number;
  minOrderAmount: number;
  requireCustomerPhone: boolean;
  allowDineIn: boolean;
  allowTakeaway: boolean;
  enableReviews: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'CASHIER' | 'BARISTA' | 'SERVICE_STAFF';
  phone?: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  validUntil?: string | null;
  usageLimit?: number | null;
  timesUsed: number;
  isActive: boolean;
}

export interface InventoryIngredient {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStockAlert: number;
  unitCost: number;
  supplier?: string;
  isLowStock?: boolean;
}
