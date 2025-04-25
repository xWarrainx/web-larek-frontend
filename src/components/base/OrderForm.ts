import { Component } from "./Component";
import { EventEmitter } from "./events";
import { PaymentMethod } from "../../types";

// Форма заказа
export class OrderForm extends Component<{ payment: PaymentMethod | null; address: string }> {
    private paymentButtons: NodeListOf<HTMLButtonElement>;
    private addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, protected events: EventEmitter) {
        super(container);

        this.paymentButtons = this.container.querySelectorAll('.button_alt');
        this.addressInput = this.container.querySelector('.form__input');

        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.toggleButtons(button);
                this.events.emit('order:payment:change', { payment: button.name as PaymentMethod });
            });
        });

        this.addressInput.addEventListener('change', () => {
            this.events.emit('order:address:change', { address: this.addressInput.value });
        });
    }

    private toggleButtons(selected: HTMLButtonElement): void {
        this.paymentButtons.forEach(button => {
            button.classList.toggle('button_alt-active', button === selected);
        });
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