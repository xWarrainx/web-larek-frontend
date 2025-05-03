import { Component } from "./Component";
import { EventEmitter } from "./events";
import { IBasketItem } from "../../types";

export class BasketItem extends Component<IBasketItem> {
    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.setHandler('.basket__item-delete', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.events.emit('basket:remove', { id: this.container.dataset.id });
        });
    }

    render(item: IBasketItem): HTMLElement {
        this.setText('.basket__item-index', String(item.index));
        this.setText('.card__title', item.title);
        this.setText('.card__price', `${item.price} синапсов`);
        this.container.dataset.id = item.id;
        return this.container;
    }
}