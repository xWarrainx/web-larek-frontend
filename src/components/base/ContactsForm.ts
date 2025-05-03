import { Form } from "./Form";
import { EventEmitter } from "./events";
import { FormErrors } from "../../types";
import { ensureElement } from "../../utils/utils";

export class ContactsForm extends Form<void> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.emailInput = ensureElement<HTMLInputElement>('[name="email"]', container);
        this.phoneInput = ensureElement<HTMLInputElement>('[name="phone"]', container);
        this.submitButton = ensureElement<HTMLButtonElement>('[type="submit"]', container);

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.emailInput.addEventListener('input', () => {
            this.events.emit('contacts:emailChange', {
                value: this.emailInput.value
            });
        });

        this.phoneInput.addEventListener('input', () => {
            this.events.emit('contacts:phoneChange', {
                value: this.phoneInput.value
            });
        });

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('contacts:submit');
        });
    }

    setErrors(errors: FormErrors): void {
        const errorMessages = [];

        if (errors.email) {
            errorMessages.push(errors.email);
        }

        if (errors.phone) {
            errorMessages.push(errors.phone);
        }

        this.setError(errorMessages.join('\n'));
    }

    setValid(state: boolean): void {
        this.submitButton.disabled = !state;
    }

    reset(): void {
        this.emailInput.value = '';
        this.phoneInput.value = '';
        this.setError('');
        this.setValid(false);
    }
}