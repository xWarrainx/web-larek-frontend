import { Form } from "./Form";
import { EventEmitter } from "./events";
import { FormErrors } from "../../types";
import { ensureElement } from "../../utils/utils";

export class OrderForm extends Form<void> {
    protected paymentButtons: HTMLButtonElement[];
    protected addressInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.paymentButtons = [
            ensureElement<HTMLButtonElement>('[name="card"]', container),
            ensureElement<HTMLButtonElement>('[name="cash"]', container)
        ];

        this.addressInput = ensureElement<HTMLInputElement>('[name="address"]', container);
        this.submitButton = ensureElement<HTMLButtonElement>('.order__button', container);

        this.setupEventListeners();
        this.updateSubmitButton();
    }

    private setupEventListeners(): void {
        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectPaymentMethod(button);
                this.events.emit('order:paymentChange', { value: button.name });
                this.updateSubmitButton();
            });
        });

        this.addressInput.addEventListener('input', () => {
            this.events.emit('order:addressChange', { value: this.addressInput.value });
            this.updateSubmitButton();
        });

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('order:submit');
        });
    }

    private selectPaymentMethod(selectedButton: HTMLButtonElement): void {
        this.paymentButtons.forEach(button => {
            button.classList.toggle('button_alt-active', button === selectedButton);
            button.classList.toggle('button_alt', button !== selectedButton);
        });
    }

    setErrors(errors: FormErrors): void {
        this.setError('');
    }

    private updateSubmitButton(): void {
        const isPaymentSelected = this.paymentButtons.some(btn =>
            btn.classList.contains('button_alt-active')
        );
        const isAddressFilled = this.addressInput.value.trim() !== '';

        this.submitButton.disabled = !(isPaymentSelected && isAddressFilled);
    }
}