import { Form } from "./Form";
import { EventEmitter } from "./events";

export class OrderForm extends Form {
    private paymentMethod: string = '';

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        // Обработка выбора способа оплаты
        const paymentButtons = this.container.querySelectorAll('button[type="button"]');
        paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Удаляем активный класс у всех кнопок
                paymentButtons.forEach(btn => {
                    btn.classList.remove('button_alt-active');
                });

                // Добавляем класс к выбранной кнопке
                button.classList.add('button_alt-active');

                // Сохраняем выбранный способ оплаты
                this.paymentMethod = button.getAttribute('name') || '';

                // Обновляем состояние кнопки "Далее"
                this.updateSubmitButton(this.validate());
            });
        });

        // Валидация при изменении адреса
        const addressInput = this.container.querySelector('input[name="address"]');
        addressInput?.addEventListener('input', () => {
            this.updateSubmitButton(this.validate());
        });
    }

    protected validate(): boolean {
        const addressInput = this.container.querySelector('input[name="address"]') as HTMLInputElement;
        return !!this.paymentMethod && addressInput?.value.trim().length > 0;
    }

    public getFormData() {
        const addressInput = this.container.querySelector('input[name="address"]') as HTMLInputElement;
        return {
            payment: this.paymentMethod,
            address: addressInput.value
        };
    }
}