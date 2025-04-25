export interface IProduct {
    id: string;
    title: string;
    price: number;
    description: string;
    image: string;
    category: string;
}

export interface IOrder {
    items: string[];
    payment: 'online' | 'offline' | null;
    address: string;
    email: string;
    phone: string;
    total: number;
}

export type PaymentMethod = 'online' | 'offline';

export interface IOrderForm {
    payment: PaymentMethod;
    address: string;
    email: string;
    phone: string;
}

export type FormErrors = Partial<Record<keyof IOrderForm, string>>;