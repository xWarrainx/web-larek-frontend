import { Component } from "./Component";
import { EventEmitter } from "./events";
import { AppData } from "./AppData";

export class Page extends Component<{ counter: number }> {
    private counterElement: HTMLElement;

    constructor(
        container: HTMLElement,
        protected events: EventEmitter,
        private appData: AppData
    ) {
        super(container, events);

        // Инициализация элементов
        this.counterElement = this.container.querySelector('.header__basket-counter')!;

        // Подписка на события
        events.on('basket:changed', () => {
            this.updateBasketCounter();
        });
    }

    // Блокировка страницы при открытии модальных окон
    set locked(value: boolean) {
        this.container.classList.toggle('page_locked', value);
    }

    // Обновление счётчика корзины
    private updateBasketCounter(): void {
        this.counterElement.textContent = String(this.appData.basket.length);
        this.counterElement.classList.add('header__basket-counter--updated');

        setTimeout(() => {
            this.counterElement.classList.remove('header__basket-counter--updated');
        }, 300);
    }
}