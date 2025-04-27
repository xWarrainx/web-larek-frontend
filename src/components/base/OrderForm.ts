import { Component } from "./Component";
import { EventEmitter } from "./events";
import { PaymentMethod, IOrderForm } from "../../types";

// Форма заказа
export class OrderForm {
    protected _template: HTMLTemplateElement;
    protected _events: EventEmitter;
    protected _paymentButtons: HTMLButtonElement[];
    protected _submitButton: HTMLButtonElement;
    protected _form: HTMLFormElement;

    constructor(template: HTMLTemplateElement, events: EventEmitter) {
        this._template = template;
        this._events = events;
    }

    render(): HTMLElement {
        const element = this._template.content.querySelector('.form')?.cloneNode(true) as HTMLElement;
        if (!element) throw new Error('Order form element not found in template');

        this._form = element as HTMLFormElement;
        this._paymentButtons = Array.from(element.querySelectorAll('.button_alt'));
        this._submitButton = element.querySelector('.order__button');

        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setPaymentMethod(button.name);
            });
        });

        this._form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._events.emit('order:submit');
        });

        this._form.addEventListener('input', () => {
            this.validateForm();
        });

        return element;
    }

    setPaymentMethod(method: string) {
        this._paymentButtons.forEach(button => {
            button.classList.toggle('button_alt-active', button.name === method);
        });
        this._events.emit('order.payment:change', { method });
        this.validateForm();
    }

    validateForm() {
        const addressInput = this._form.elements.namedItem('address') as HTMLInputElement;
        const isAddressValid = addressInput.value.trim().length > 0;
        const isPaymentSelected = this._paymentButtons.some(btn =>
            btn.classList.contains('button_alt-active')
        );

        this._submitButton.disabled = !(isAddressValid && isPaymentSelected);
    }

    getFormData(): IOrderForm {
        const formData = new FormData(this._form);
        const paymentMethod = this._paymentButtons.find(btn =>
            btn.classList.contains('button_alt-active')
        )?.name;

        return {
            payment: paymentMethod,
            address: formData.get('address') as string,
            email: '',
            phone: ''
        };
    }
}

// Форма контактов
interface ContactsData {
    email: string;
    phone: string;
}

export class ContactsForm extends Component<ContactsData> {
    private emailInput: HTMLInputElement;
    private phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, protected events: EventEmitter) {
        super(container);

        this.emailInput = this.container.querySelector('[name="email"]');
        this.phoneInput = this.container.querySelector('[name="phone"]');

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit('contacts:submit', {
                email: this.emailInput.value,
                phone: this.phoneInput.value
            });
        });
    }
}

// Успешное оформление
export class Success extends Component<{ total: number }> {
    private description: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this.description = this.container.querySelector('.order-success__description');
        const button = this.container.querySelector('.order-success__close');
        button.addEventListener('click', () => this.events.emit('success:close'));
    }

    render(data: { total: number }): void {
        this.description.textContent = `Списано ${data.total} ₽`;
    }
}