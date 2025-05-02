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
        this.subscribeToEvents();
    }

    private subscribeToEvents(): void {
        this.events.on('order:paymentChange', (event: { value: string }) => {
            this._order.payment = event.value;
        });

        this.events.on('order:addressChange', (event: { value: string }) => {
            this._order.address = event.value;
        });

        this.events.on('contacts:emailChange', (event: { value: string }) => {
            this._order.email = event.value;
        });

        this.events.on('contacts:phoneChange', (event: { value: string }) => {
            this._order.phone = event.value;
        });
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

    getPurchaseIds(): string[] {
        return this._basket.map(item => item.id);
    }

    getOrderData(): IOrder {
        return {
            ...this._order,
            items: this.getPurchaseIds(),
            total: this.getTotal()
        };
    }

    get basketCount(): number {
        return this._basket.length;
    }

    get order(): IOrderForm {
        return this._order;
    }

    // Добавляет товар в корзину, если его там еще нет
    // @param product - товар для добавления
    addToBasket(product: IProduct) {
        if (!this.isInBasket(product)) {
            this._basket.push(product);
            this.events.emit('basket:changed', this._basket);
        }
    }

    // Удаляет товар из корзины по ID
    // @param id - ID товара для удаления
    removeFromBasket(id: string) {
        this._basket = this._basket.filter(item => item.id !== id);
        this.events.emit('basket:changed', this._basket);
    }

    clearBasket() {
        this._basket = [];
        this.events.emit('basket:changed', this._basket);
    }

    setOrderField(field: 'payment' | 'address' | 'email' | 'phone', value: string): void {
        this._order[field] = value;
    }

    // Проверяет валидность данных заказа (адрес и способ оплаты)
    // @returns Объект с ошибками валидации
    validateOrder(): FormErrors {
        const errors: FormErrors = {};
        if (!this._order.payment) errors.payment = 'Выберите способ оплаты';
        if (!this._order.address) errors.address = 'Введите адрес доставки';
        return errors;
    }

    // Проверяет валидность контактных данных (email и номер телефона)
    // @returns Объект с ошибками валидации
    validateContacts(): FormErrors {
        const errors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!this._order.email) {
            errors.email = 'Введите email';
        } else if (!emailRegex.test(this._order.email)) {
            errors.email = 'Введите корректный email';
        }

        const phoneDigits = this._order.phone.replace(/\D/g, '');
        if (!this._order.phone) {
            errors.phone = 'Введите номер телефона';
        } else if (phoneDigits.length < 10) {
            errors.phone = 'Введите корректный номер (минимум 10 цифр)';
        }

        return errors;
    }

    isOrderValid(): boolean {
        return Object.keys(this.validateOrder()).length === 0;
    }

    isContactsValid(): boolean {
        return Object.keys(this.validateContacts()).length === 0;
    }

    getOrderState(): { paymentSelected: boolean; addressFilled: boolean } {
        return {
            paymentSelected: !!this._order.payment,
            addressFilled: !!this._order.address.trim()
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
    }
}