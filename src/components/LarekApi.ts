import { IProduct, IOrder, IOrderResult } from '../types';
import { Api, ApiListResponse } from './base/api';

export interface ILarekApi {
    getProductList(): Promise<ApiListResponse<IProduct>>;
    getProductItem(id: string): Promise<IProduct>;
    createOrder(order: IOrder): Promise<{ id: string }>;
}

export class LarekApi extends Api implements ILarekApi {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getProductList(): Promise<ApiListResponse<IProduct>> {
        return this.get<ApiListResponse<IProduct>>('/product')
            .then((data: ApiListResponse<IProduct>) => ({
                total: data.total,
                items: data.items.map((item: IProduct) => ({
                    ...item,
                    image: this.cdn + item.image.replace(".svg", ".png")
                }))
            }));
    }

    getProductItem(id: string): Promise<IProduct> {
        return this.get<IProduct>(`/product/${id}`)
            .then((item: IProduct) => ({
                ...item,
                image: this.cdn + item.image
            }));
    }

    createOrder(order: IOrder): Promise<{ id: string }> {
        return this.post<{ id: string }>('/order', order);
    }

    orderProducts(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order)
            .then((data: IOrderResult) => data);
    }
}