import { Form } from "./Form";
import { EventEmitter } from "./events";

interface IOrderData {
    payment: string;
    address: string;
}

export class OrderForm extends Form<IOrderData> {
    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.setHandler('[name="card"]', 'click', () => this.selectPayment('card'));
        this.setHandler('[name="cash"]', 'click', () => this.selectPayment('cash'));
        this.setHandler('form', 'submit', (e: Event) => {
            e.preventDefault();
            const address = (this.container.querySelector('[name="address"]') as HTMLInputElement).value;
            const payment = this.container.querySelector('[name="payment"]:checked') as HTMLInputElement;

            if (payment && address) {
                this.events.emit('order:submit', {
                    payment: payment.value,
                    address
                });
            }
        });
    }

    private selectPayment(method: string): void {
        this.setClass('[name="card"]', method === 'card' ? 'button_alt-active' : '');
        this.setClass('[name="cash"]', method === 'cash' ? 'button_alt-active' : '');
    }
}