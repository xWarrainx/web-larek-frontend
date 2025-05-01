import { EventEmitter } from "./events";
import { IProduct } from "../../types";

export class Basket {
    protected _element: HTMLElement;
    protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLElement;

    constructor(
        protected template: HTMLTemplateElement,
        protected events: EventEmitter
    ) {
        this._element = template.content.firstElementChild?.cloneNode(true) as HTMLElement;
        if (!this._element) throw new Error('Basket template error');

        this._list = this._element.querySelector('.basket__list')!;
        this._price = this._element.querySelector('.basket__price')!;
        this._button = this._element.querySelector('.basket__button')!;

        this._button.addEventListener('click', () => {
            events.emit('order:open');
        });
    }

    render(data: { items: IProduct[], total: number }): HTMLElement {
        this._list.innerHTML = '';

        data.items.forEach((item, index) => {
            const itemTemplate = document.getElementById('card-basket') as HTMLTemplateElement;
            const itemElement = itemTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement;

            itemElement.querySelector('.card__title')!.textContent = item.title;
            itemElement.querySelector('.card__price')!.textContent = `${item.price} синапсов`;
            itemElement.querySelector('.basket__item-index')!.textContent = (index + 1).toString();

            itemElement.querySelector('.basket__item-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.events.emit('basket:remove', { id: item.id });
            });

            this._list.appendChild(itemElement);
        });

        this._price.textContent = `${data.total} синапсов`;
        return this._element;
    }
}