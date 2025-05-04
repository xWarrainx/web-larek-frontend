import { Component } from "./Component";
import { EventEmitter } from "./events";
import { ensureElement } from "../../utils/utils";

interface IBasketData {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<IBasketData> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _checkoutButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        // вместо ensureElement использую querySelector, так как иначе
        // появляется ошибка при загрузке сайте, не получается найти элемент .basket__list,
        // он создается позже, при добавлении товара в корзину,
        // при объявлении через querySelector мы обходим данную ошибку.
        this._list = this.container.querySelector('.basket__list') || document.createElement('div');
        this._total = this.container.querySelector('.basket__price') || document.createElement('div');
        this._checkoutButton = this.container.querySelector('.basket__button') || document.createElement('button');

        // Добавляем классы, если элементы были созданы
        if (!this.container.querySelector('.basket__list')) {
            this._list.className = 'basket__list';
            this.container.appendChild(this._list);
        }
    }


    set items(items: HTMLElement[]) {
        this._list.replaceChildren(...items);
        this._checkoutButton.disabled = items.length === 0;
    }

    set total(value: number) {
        this._total.textContent = `${value} синапсов`;
    }
}