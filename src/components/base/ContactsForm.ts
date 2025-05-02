import { Form } from "./Form";
import { EventEmitter } from "./events";
import { FormErrors } from "../../types";

export class ContactsForm extends Form<void> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.emailInput = container.querySelector('[name="email"]') as HTMLInputElement;
        this.phoneInput = container.querySelector('[name="phone"]') as HTMLInputElement;
        this.submitButton = container.querySelector('[type="submit"]') as HTMLButtonElement;

        this.resetForm();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.emailInput.addEventListener('input', () => {
            this.validateEmail();
            this.updateSubmitButton();
        });

        this.phoneInput.addEventListener('input', () => {
            this.validatePhone();
            this.updateSubmitButton();
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            if (!this.submitButton.disabled) {
                this.events.emit('contacts:submit');
            }
        });
    }

    private validateEmail(): void {
        const email = this.emailInput.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValid && email.length > 0) {
            this.setError('Введите корректный email');
        } else {
            this.setError('');
        }

        this.events.emit('contacts:emailChange', {
            value: email
        });
    }

    private validatePhone(): void {
        const phone = this.phoneInput.value.trim();
        const isValid = phone.replace(/\D/g, '').length >= 10;

        if (!isValid && phone.length > 0) {
            this.setError('Введите корректный номер (минимум 10 цифр)');
        } else {
            this.setError('');
        }

        this.events.emit('contacts:phoneChange', {
            value: phone
        });
    }

    private updateSubmitButton(): void {
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.emailInput.value.trim());
        const isPhoneValid = this.phoneInput.value.replace(/\D/g, '').length >= 10;

        this.submitButton.disabled = !(isEmailValid && isPhoneValid);
        this.submitButton.classList.toggle('button-active', isEmailValid && isPhoneValid);
    }

    public resetForm(): void {
        this.emailInput.value = '';
        this.phoneInput.value = '';
        this.submitButton.disabled = true;
        this.submitButton.classList.remove('button-active');
        this.setError('');
    }

    public setErrors(errors: FormErrors): void {
        let errorMessage = '';
        if (errors.email) errorMessage += `${errors.email}\n`;
        if (errors.phone) errorMessage += errors.phone;
        this.setError(errorMessage.trim());
    }
}