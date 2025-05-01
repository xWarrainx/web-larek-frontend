import { Component } from "./Component";
import { EventEmitter } from "./events";
import { IProduct } from "../../types";

export class BasketItem extends Component<IProduct> {
    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.setHandler('.basket__item-delete', 'click', (e) => {
            e.stopPropagation();
            this.events.emit('basket:remove', { id: this.container.dataset.id });
        });
    }

    render(item: IProduct): HTMLElement {
        this.setText('.card__title', item.title);
        this.setText('.card__price', `${item.price} синапсов`);
        this.container.dataset.id = item.id;
        return this.container;
    }
}