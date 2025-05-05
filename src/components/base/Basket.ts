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

        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._checkoutButton = ensureElement<HTMLButtonElement>('.basket__button', container);

        this._checkoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            events.emit('order:open');
        });
    }

    set list(items: HTMLElement[]) {
        this._list.replaceChildren(...items);
        this._checkoutButton.disabled = items.length === 0;
    }

    set total(value: number) {
        this._total.textContent = `${value} синапсов`;
    }
}