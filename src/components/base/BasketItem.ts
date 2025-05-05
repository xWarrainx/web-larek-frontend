import { Component } from "./Component";
import { EventEmitter } from "./events";
import { IBasketItem } from "../../types";

export class BasketItem extends Component<IBasketItem> {
    static create(item: IBasketItem, events: EventEmitter): HTMLElement {
        const template = document.getElementById('card-basket') as HTMLTemplateElement;
        const element = template?.content.firstElementChild?.cloneNode(true) as HTMLElement;

        if (!element) {
            throw new Error('Basket item template not found');
        }

        const basketItem = new BasketItem(element, events);
        basketItem.render(item);
        return element;
    }

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.setHandler('.basket__item-delete', 'click', (e) => {
            e.preventDefault();
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