import { Component } from "./Component";
import { EventEmitter } from "./events";
import { PaymentMethod, IOrderForm } from "../../types";

export class OrderForm extends Component<IOrderForm> {

    protected _paymentButtons: HTMLButtonElement[];
    protected _submitButton: HTMLButtonElement;
    protected _form: HTMLFormElement;
    protected _formType: 'order' | 'contacts';
    private _events: EventEmitter;

    constructor(
        container: HTMLElement,
        events: EventEmitter,
        formType: 'order' | 'contacts'
    ) {
        super(container);
        this._events = events;
        this._formType = formType;

        this._form = this.container.querySelector('form') as HTMLFormElement;
        if (!this._form) throw new Error('Form element not found');

        this._initializeElements();
        this._bindEvents();
    }

    render(): HTMLElement {
        return this.getContainer();
    }
    protected _initializeElements(): void {
        this._paymentButtons = Array.from(this._form.querySelectorAll('.button_alt'));
        this._submitButton = this._form.querySelector(
            this._formType === 'order' ? '.order__button' : '.button'
        ) as HTMLButtonElement;
    }

    protected _bindEvents(): void {
        if (this._formType === 'order') {
            this._paymentButtons.forEach(button => {
                button.addEventListener('click', () => {
                    this.setPaymentMethod(button.name);
                });
            });
        }

        this._form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                this._events.emit(`${this._formType}:submit`, this.getFormData());
            }
        });

        this._form.addEventListener('input', () => {
            this.validateForm();
        });
    }

    setPaymentMethod(method: string): void {
        this._paymentButtons.forEach(button => {
            if (button.name === method) {
                button.classList.add('button_alt-active');
            } else {
                button.classList.remove('button_alt-active');
            }
        });
        this._events.emit('order.payment:change', { method });
        this.validateForm();
    }

    validateForm(): boolean {
        if (this._formType === 'order') {
            const addressInput = this._form.querySelector('input[name="address"]') as HTMLInputElement;
            const isAddressValid = addressInput?.value.trim().length > 0;

            // Проверяем, что выбран способ оплаты
            const isPaymentSelected = this._paymentButtons.some(btn =>
                btn.classList.contains('button_alt-active')
            );

            // Получаем кнопку submit
            const submitButton = this._form.querySelector('.order__button') as HTMLButtonElement;
            if (submitButton) {
                submitButton.disabled = !(isAddressValid && isPaymentSelected);
            }

            return isAddressValid && isPaymentSelected;
        } else {
            // Валидация для формы контактов
            const emailInput = this._form.querySelector('input[name="email"]') as HTMLInputElement;
            const phoneInput = this._form.querySelector('input[name="phone"]') as HTMLInputElement;

            const isEmailValid = this._validateEmail(emailInput);
            const isPhoneValid = this._validatePhone(phoneInput);

            // Получаем кнопку оплаты
            const payButton = this._form.querySelector('.button[type="submit"]') as HTMLButtonElement;
            if (payButton) {
                payButton.disabled = !(isEmailValid && isPhoneValid);

                // Добавляем/удаляем класс для визуального состояния
                if (isEmailValid && isPhoneValid) {
                    payButton.classList.remove('button--disabled');
                } else {
                    payButton.classList.add('button--disabled');
                }
            }

            return isEmailValid && isPhoneValid;
        }
    }

    private _validateEmail(input: HTMLInputElement): boolean {
        const value = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);

        this._toggleError(input, !isValid, 'Введите корректный email');
        return isValid;
    }

    private _validatePhone(input: HTMLInputElement): boolean {
        const value = input.value.trim();
        // Проверяем, что телефон содержит минимум 10 цифр
        const digitsOnly = value.replace(/\D/g, '');
        const isValid = digitsOnly.length >= 10;

        this._toggleError(input, !isValid, 'Введите корректный номер (минимум 10 цифр)');
        return isValid;
    }

    private _toggleError(input: HTMLInputElement, show: boolean, message?: string): void {
        const fieldContainer = input.closest('.order__field');

        if (show) {
            this.setClass(`input[name="${input.name}"]`, 'invalid', true);
            if (message && !fieldContainer?.querySelector('.error-message')) {
                const errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.textContent = message;
                fieldContainer?.appendChild(errorElement);
            }
        } else {
            this.setClass(`input[name="${input.name}"]`, 'invalid', false);
            fieldContainer?.querySelector('.error-message')?.remove();
        }
    }

    getFormData(): IOrderForm {
        const formData = new FormData(this._form);
        const paymentMethod = this._paymentButtons.find(btn =>
            btn.classList.contains('button_alt-active')
        )?.name;

        return {
            payment: paymentMethod as PaymentMethod,
            address: formData.get('address') as string,
            email: this._formType === 'contacts' ? formData.get('email') as string : '',
            phone: this._formType === 'contacts' ? formData.get('phone') as string : ''
        };
    }

    // Реализация методов Component
    setText(selector: string, text: string): void {
        const element = this.container.querySelector(selector);
        if (element) element.textContent = text;
    }

    setClass(selector: string, className: string, state?: boolean): void {
        const element = this.container.querySelector(selector);
        if (element) {
            if (state === undefined) {
                element.classList.add(className);
            } else {
                element.classList.toggle(className, state);
            }
        }
    }

    setImage(selector: string, src: string, alt?: string): void {
        const element = this.container.querySelector(selector) as HTMLImageElement;
        if (element) {
            element.src = src;
            if (alt) element.alt = alt;
        }
    }

    setDisabled(selector: string, state: boolean): void {
        const element = this.container.querySelector(selector) as HTMLElement;
        if (element) {
            element.toggleAttribute('disabled', state);
        }
    }
}