import { Form } from "./Form";
import { EventEmitter } from "./events";
import { FormErrors } from "../../types";

export class OrderForm extends Form<void> {
    protected paymentButtons: HTMLButtonElement[];
    protected addressInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        // Ищем кнопки по конкретным name
        this.paymentButtons = [
            container.querySelector('[name="card"]'),
            container.querySelector('[name="cash"]')
        ].filter(Boolean) as HTMLButtonElement[];

        this.addressInput = container.querySelector('[name="address"]') as HTMLInputElement;
        this.submitButton = container.querySelector('.order__button') as HTMLButtonElement;

        // Проверка найденных элементов
        if (this.paymentButtons.length !== 2) {
            console.error('Не найдены кнопки оплаты:', {
                found: this.paymentButtons.length,
                html: container.innerHTML
            });
        }

        // Инициализация
        this.resetForm();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Обработчики кнопок оплаты
        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectPayment(button);
            });
        });

        // Обработчик поля адреса
        this.addressInput.addEventListener('input', () => {
            this.checkFormValidity();
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            if (!this.submitButton.disabled) {
                this.events.emit('order:submit', {
                    payment: this.getSelectedPayment(),
                    address: this.addressInput.value
                });
            }
        });

    }

    private getSelectedPayment(): string {
        const selectedButton = this.paymentButtons.find(
            btn => btn.classList.contains('button_alt-active')
        );
        return selectedButton?.name || '';
    }

    private selectPayment(selectedButton: HTMLButtonElement): void {
        // Сбрасываем все кнопки
        this.paymentButtons.forEach(button => {
            button.classList.remove('button_alt-active');
            button.classList.add('button_alt');
        });

        // Устанавливаем выбранную кнопку
        selectedButton.classList.add('button_alt-active');
        selectedButton.classList.remove('button_alt');

        this.events.emit('order:paymentChange', {
            value: selectedButton.name // Используем name вместо value
        });

        this.checkFormValidity();
    }

    private checkFormValidity(): void {
        const isPaymentSelected = this.paymentButtons.some(
            btn => btn.classList.contains('button_alt-active')
        );
        const isAddressFilled = this.addressInput.value.trim().length > 0;

        if (isPaymentSelected && isAddressFilled) {
            this.submitButton.classList.add('button-active');
            this.submitButton.disabled = false;
        } else {
            this.submitButton.classList.remove('button-active');
            this.submitButton.disabled = true;
        }
    }

    public resetForm(): void {
        this.paymentButtons.forEach(button => {
            button.classList.remove('button_alt-active');
            button.classList.add('button_alt');
        });
        this.addressInput.value = '';
        this.submitButton.classList.remove('button-active');
        this.submitButton.disabled = true;
    }

    public setErrors(errors: FormErrors): void {
        let errorMessage = '';
        if (errors.payment) errorMessage += `${errors.payment}\n`;
        if (errors.address) errorMessage += errors.address;
        this.setError(errorMessage.trim());
    }
}