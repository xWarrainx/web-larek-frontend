export interface IProduct {
    id: string;
    title: string;
    price: number | null;
    description?: string;
    image: string;
    category: string;
}

export interface IOrder {
    items: string[];
    payment: string;
    address: string;
    email: string;
    phone: string;
    total: number;
}
export interface IOrderResult {
    id: string
}

export type PaymentMethod = 'online' | 'offline';

export interface IOrderForm {
    payment: string;
    address: string;
    email: string;
    phone: string;
}

export type FormErrors = Partial<Record<keyof IOrderForm, string>>;