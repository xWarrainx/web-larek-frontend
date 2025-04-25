import { Model } from "./Model";
import { IProduct, IOrder, PaymentMethod, IOrderForm } from "../../types";
import { EventEmitter } from "./events";

interface AppState {
    catalog: IProduct[];
    order: IOrder;
    preview: string | null;
}

export class AppData extends Model<AppState> {
    private _catalog: IProduct[] = [];
    private _order: IOrder = {
        items: [],
        payment: null,
        address: '',
        email: '',
        phone: '',
        total: 0
    };
    private _preview: string | null = null;

    constructor(events: EventEmitter) {
        super({}, events);
    }

    set catalog(items: IProduct[]) {
        console.log('Установка каталога:', items);
        this._catalog = items;
        this.emitChanges('items:changed', items); // Явно передаем массив items
    }

    get catalog(): IProduct[] {
        return this._catalog;
    }

    get order(): IOrder {
        return this._order;
    }

    set preview(value: string) {
        this._preview = value;
        this.emitChanges('preview:changed', { preview: this._preview });
    }

    addToBasket(item: IProduct): void {
        if (!this._order.items.includes(item.id)) {
            this._order.items.push(item.id);
            this._order.total += item.price;
            this.emitChanges('basket:changed', this._order);
        }
    }

    removeFromBasket(id: string): void {
        this._order.items = this._order.items.filter(item => item !== id);
        const product = this._catalog.find(it => it.id === id);
        if (product) {
            this._order.total -= product.price;
        }
        this.emitChanges('basket:changed', { order: this._order });
    }

    clearBasket(): void {
        this._order = {
            items: [],
            payment: null,
            address: '',
            email: '',
            phone: '',
            total: 0
        };
        this.emitChanges('basket:changed', { order: this._order });
    }

    setPaymentMethod(method: PaymentMethod): void {
        this._order.payment = method;
        this.emitChanges('order:payment', { order: this._order });
    }

    setAddress(address: string): void {
        this._order.address = address;
        this.emitChanges('order:address', { order: this._order });
    }

    setContactField(field: keyof IOrderForm, value: string): void {
        (this._order as any)[field] = value;
        this.emitChanges('order:contacts', { order: this._order });
    }

    getProduct(id: string): IProduct | undefined {
        return this._catalog.find(item => item.id === id);
    }
}