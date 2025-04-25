import { Component } from "./Component";
import { EventEmitter } from "./events";
import { IProduct } from "../../types";

// Форма корзины
interface BasketData {
    items: IProduct[];
    total: number;
}

export class Basket extends Component<BasketData> {
    private list: HTMLElement;
    private totalElement: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this.list = this.container.querySelector('.basket__list');
        this.totalElement = this.container.querySelector('.basket__price');
        events.on('basket:changed', (data: BasketData) => this.render(data));
    }

    render(data: BasketData): void {
        this.list.innerHTML = data.items.map(item => `
            <div class="basket-item" data-id="${item.id}">
                <span>${item.title}</span>
                <span>${item.price} ₽</span>
                <button data-id="${item.id}">×</button>
            </div>
        `).join('');

        this.totalElement.textContent = `${data.total} ₽`;
    }
}