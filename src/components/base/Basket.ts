import { Component } from "./Component";
import { EventEmitter } from "./events";
import { ensureElement } from "../../utils/utils";

export class Basket extends Component<{ items: HTMLElement[], total: number }> {
    protected _list?: HTMLElement;
    protected _total?: HTMLElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);
    }

    set items(items: HTMLElement[]) {
        if (!this._list) this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._list.replaceChildren(...items);

        // Обновляем состояние кнопки
        const checkoutButton = this.container.querySelector<HTMLButtonElement>('.basket__button');
        if (checkoutButton) {
            checkoutButton.disabled = items.length === 0;
        }
    }

    set total(value: number) {
        if (!this._total) this._total = ensureElement<HTMLElement>('.basket__price', this.container);
        this._total.textContent = `${value} синапсов`;
    }
}