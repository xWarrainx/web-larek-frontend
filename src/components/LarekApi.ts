import { IProduct, IOrder } from '../types';
import { Api, ApiListResponse } from './base/api';

/*----- Интерфейс API-клиента -----*/
export interface IApiClient {
    getProductList: () => Promise<ApiListResponse<IProduct>>;
    getProductItem: (id: string) => Promise<IProduct>;
    createOrder: (order: IOrder) => Promise<{ id: string }>;
}

/*----- Реализация API -----*/
export class LarekApi extends Api implements IApiClient {
    private readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getProductList(): Promise<ApiListResponse<IProduct>> {
        return this.get('/product')
            .then((data: ApiListResponse<IProduct>) => ({
                total: data.total,
                items: data.items.map(item => ({
                    ...item,
                    image: this.cdn + item.image
                }))
            }));
    }

    getProductItem(id: string): Promise<IProduct> {
        return this.get(`/product/${id}`)
            .then((item: IProduct) => ({
                ...item,
                image: this.cdn + item.image,
            })
        );
    }

    createOrder(order: IOrder): Promise<{ id: string }> {
        return this.post('/order', order)
            .then((data: { id: string }) => data);
    }
}