import { Component } from "./Component";
import { EventEmitter } from "./events";
import { IProduct } from "../../types";
import { BasketItem } from "./BasketItem";

export class Basket extends Component<{ items: IProduct[], total: number }> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    private _itemTemplate: HTMLTemplateElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this._list = this.container.querySelector('.basket__list')!;
        this._total = this.container.querySelector('.basket__price')!;
        this._button = this.container.querySelector('.basket__button')!;
        this._itemTemplate = document.getElementById('card-basket') as HTMLTemplateElement;

        this.setHandler('.basket__button', 'click', () => {
            this.events.emit('order:open');
        });
    }

    // Устанавливает список товаров в корзине.
    // Очищает текущий список и добавляет новые элементы на основе переданного массива товаров.
    // Каждому товару присваивается порядковый номер.
    // @param items - Массив товаров для отображения в корзине
    set items(items: IProduct[]) {
        this._list.innerHTML = '';
        items.forEach((item, index) => {
            const itemElement = this._itemTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement;
            if (!itemElement) return;

            itemElement.querySelector('.basket__item-index')!.textContent = (index + 1).toString();
            const basketItem = new BasketItem(itemElement, this.events);
            this._list.appendChild(basketItem.render(item));
        });
    }

    set total(value: number) {
        this.setText('.basket__price', `${value} синапсов`);
    }
}