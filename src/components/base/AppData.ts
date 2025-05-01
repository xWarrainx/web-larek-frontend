import { EventEmitter } from "./events";
import { IProduct } from "../../types";
import { IOrder } from "../../types";

export class AppData {
    private _catalog: IProduct[] = [];
    private _basket: IProduct[] = [];
    private _order: IOrder = {
        payment: '',
        email: '',
        phone: '',
        address: '',
        total: 0,
        items: []
    };
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    set catalog(items: IProduct[]) {
        this._catalog = items;
        this.events.emit('items:changed', this._catalog);
    }

    get catalog(): IProduct[] {
        return this._catalog;
    }

    isInBasket(product: IProduct): boolean {
        return this._basket.some(item => item.id === product.id);
    }

    get basket(): IProduct[] {
        return this._basket;
    }

    get basketCount(): number {
        return this._basket.length;
    }

    get order() {
        return this._order;
    }

    addToBasket(product: IProduct) {
        if (!this.isInBasket(product)) {
            this._basket.push(product);
        }
    }

    removeFromBasket(id: string) {
        this._basket = this._basket.filter(item => item.id !== id);
    }

    private updateOrder() {
        this._order.items = this._basket.map(item => item.id);
        this._order.total = this.getOrderTotal();
    }

    getOrderTotal(): number {
        return this._basket.reduce((total, item) => total + (item.price || 0), 0);
    }

    clearBasket() {
        this._basket = [];
    }
}