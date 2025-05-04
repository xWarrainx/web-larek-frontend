import { EventEmitter } from "./events";
import { IProduct, IOrder, IOrderForm, FormErrors } from "../../types";

export class AppData {
    private _catalog: IProduct[] = [];
    private _basket: IProduct[] = [];
    private _order: IOrderForm = {
        payment: '',
        email: '',
        phone: '',
        address: ''
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

    getTotal(): number {
        return this._basket.reduce((total, item) => total + (item.price || 0), 0);
    }

    get basketCount(): number {
        return this._basket.length;
    }

    get order(): IOrderForm {
        return this._order;
    }

    addToBasket(product: IProduct) {
        if (!this.isInBasket(product)) {
            this._basket.push(product);
            this.events.emit('basket:changed', this._basket);
        }
    }

    removeFromBasket(id: string) {
        const item = this._basket.find(item => item.id === id);
        this._basket = this._basket.filter(item => item.id !== id);
        this.events.emit('basket:changed', this._basket);
        if (item) {
            this.events.emit('basket:update', {
                item,
                inBasket: false
            });
        }
    }

    clearBasket() {
        this._basket = [];
        this.events.emit('basket:changed', this._basket);
    }

    setOrderField(field: keyof IOrderForm, value: string): void {
        this._order[field] = value;
    }

    validateOrder(): FormErrors {
        const errors: FormErrors = {};
        if (!this._order.payment) errors.payment = '';
        if (!this._order.address) errors.address = '';
        return errors;
    }

    validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePhone(phone: string): boolean {
        const digits = phone.replace(/\D/g, '');
        return digits.length >= 10;
    }

    validateContacts(): FormErrors {
        const errors: FormErrors = {};
        const { phone, email } = this._order;

        if (!phone || !this.validatePhone(phone)) {
            errors.phone = 'Введите корректный номер (минимум 10 цифр)';
        }

        if (!email || !this.validateEmail(email)) {
            errors.email = 'Введите корректный email';
        }

        return errors;
    }

    isOrderValid(): boolean {
        return Object.keys(this.validateOrder()).length === 0;
    }

    isContactsValid(): boolean {
        return this.validateEmail(this._order.email) &&
            this.validatePhone(this._order.phone);
    }

    getOrderPayload(): IOrder {
        if (!this.isOrderValid() || !this.isContactsValid()) {
            throw new Error('Невозможно создать заказ: невалидные данные');
        }

        return {
            payment: this._order.payment,
            email: this._order.email,
            phone: this._order.phone,
            address: this._order.address,
            items: this._basket.map(item => item.id),
            total: this.getTotal()
        };
    }

    resetOrderForm(): void {
        this._order = {
            payment: '',
            email: '',
            phone: '',
            address: ''
        };
    }

    resetAll(): void {
        this._basket = [];
        this._order = {
            payment: '',
            email: '',
            phone: '',
            address: ''
        };
        this.events.emit('basket:changed', this._basket);
        this.events.emit('order:reset');
    }
}