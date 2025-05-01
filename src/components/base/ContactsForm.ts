import { Form } from "./Form";
import { EventEmitter } from "./events";

export class ContactsForm extends Form {
    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.container.addEventListener('submit', this.handleSubmit);
    }

    protected validate(): boolean {
        const emailInput = this.container.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = this.container.querySelector('input[name="phone"]') as HTMLInputElement;

        const emailValid = emailInput.value.includes('@');
        const phoneValid = phoneInput.value.length >= 10;

        if (!emailValid) this.setError('Email должен содержать @');
        else if (!phoneValid) this.setError('Телефон слишком короткий');
        else this.setError('');

        return emailValid && phoneValid;
    }

    private handleSubmit(event: Event) {
        event.preventDefault();
        if (this.validate()) {
            const formData = this.getFormData();
            this.events.emit('contacts:submit', {
                email: formData.email,
                phone: formData.phone
            });
        }
    }

    public setError(message: string): void {
        const errorsContainer = this.container.querySelector('.form__errors');
        if (errorsContainer) {
            errorsContainer.textContent = message;
        }
    }
}