// type.d.ts
import type { Models } from 'react-native-appwrite';
import type { ImageSourcePropType } from 'react-native';
import type { ReactNode } from 'react';

/** User roles we’ll use across the app */
export type Role = 'guest' | 'host' | 'admin';

/** Property (boutique hotel) */
export interface Property extends Models.Document {
  name: string;
  code: string;
  address?: string;
  active: boolean;
}

/** Product/Package (keeping your tutorial fields, optional property linkage) */
export interface MenuItem extends Models.Document {
  name: string;
  price: number;
  image_url: string;
  description: string;
  calories: number;
  protein: number;
  rating: number;
  type: string;

  // optional fields for property/hotel scoping
  hotelId?: string | null;
  propertyId?: string | null;
  active?: boolean;
}

/** Category */
export interface Category extends Models.Document {
  name: string;
  description: string;
}

/** App user profile stored in Appwrite `users` collection */
export interface User extends Models.Document {
  name: string;
  email: string;
  avatar: string;

  // role-based access
  role: Role;

  // old field still supported
  hotelId?: string | null;

  // NEW: property context for the app
  currentPropertyId?: string | null;

  // optional profile details
  accountId?: string; // Appwrite Account $id
  phone?: string;
  roomNumber?: string;
}

/** Cart types (unchanged) */
export interface CartCustomization {
  id: string;
  name: string;
  price: number;
  type: string;
}

export interface CartItemType {
  id: string; // menu item id
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  customizations?: CartCustomization[];
}

export interface CartStore {
  items: CartItemType[];
  addItem: (item: Omit<CartItemType, 'quantity'>) => void;
  removeItem: (id: string, customizations: CartCustomization[]) => void;
  increaseQty: (id: string, customizations: CartCustomization[]) => void;
  decreaseQty: (id: string, customizations: CartCustomization[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/** UI prop types */
export interface TabBarIconProps {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}

export interface PaymentInfoStripeProps {
  label: string;
  value: string;
  labelStyle?: string;
  valueStyle?: string;
}

export interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  leftIcon?: ReactNode;
  textStyle?: string;
  isLoading?: boolean;
}

export interface CustomHeaderProps {
  title?: string;
}

export interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export interface ProfileFieldProps {
  label: string;
  value: string;
  icon: ImageSourcePropType;
}

/** Auth & data helpers */
export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface GetMenuParams {
  category: string;
  query: string;
}
