import { IProduct, IOrder } from '../types';
import { Api, ApiListResponse } from './base/api';

/*----- Интерфейс API-клиента -----*/
export interface ILarekApi {
    getProductList(): Promise<ApiListResponse<IProduct>>;
    getProductItem(id: string): Promise<IProduct>;
    createOrder(order: IOrder): Promise<{ id: string }>;
}

/*----- Реализация API -----*/
export class LarekApi extends Api implements ILarekApi {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    async getProductList(): Promise<ApiListResponse<IProduct>> {
        const data = await this.get<ApiListResponse<IProduct>>('/product');
        return {
            total: data.total,
            items: data.items.map((item: IProduct) => ({
                ...item,
                image: this.cdn + item.image
            }))
        };
    }

    async getProductItem(id: string): Promise<IProduct> {
        const item = await this.get<IProduct>(`/product/${id}`);
        return {
            ...item,
            image: this.cdn + item.image
        };
    }

    async createOrder(order: IOrder): Promise<{ id: string }> {
        return await this.post<{ id: string }>('/order', order);
    }
}