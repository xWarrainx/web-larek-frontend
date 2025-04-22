/*----- Базовые типы данных API -----*/
export interface IProduct {
    id: string;
    title: string;
    description: string;
    price: number | null;
    category: string;
    image: string;
}

export interface IOrder {
    items: string[];
    total: number;
    payment: 'online' | 'offline';
    address: string;
    email: string;
    phone: string;
}