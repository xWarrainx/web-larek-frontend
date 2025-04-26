import { EventEmitter } from "../base/events";
import { IProduct } from "../../types";

interface IBasketView {
    items: IProduct[];
    total: number;
}

export class Basket {
    protected _template: HTMLTemplateElement;
    protected _events: EventEmitter;
    protected _listElement: HTMLElement;
    protected _totalElement: HTMLElement;

    constructor(template: HTMLTemplateElement, events: EventEmitter) {
        this._template = template;
        this._events = events;
    }

    render(data: IBasketView): HTMLElement {
        const element = this._template.content.querySelector('.basket')?.cloneNode(true) as HTMLElement;
        if (!element) throw new Error('Basket element not found in template');

        this._listElement = element.querySelector('.basket__list');
        this._totalElement = element.querySelector('.basket__price');
        const button = element.querySelector('.basket__button');

        this.updateList(data.items);
        this.updateTotal(data.total);

        if (button) {
            button.addEventListener('click', () => {
                this._events.emit('order:open');
            });
        }

        element.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const deleteButton = target.closest('.basket__item-delete');
            if (deleteButton) {
                const id = deleteButton.getAttribute('data-id');
                if (id) {
                    this._events.emit('basket:remove', { id });
                }
            }
        });

        return element;
    }

    updateList(items: IProduct[]) {
        if (this._listElement) {
            this._listElement.innerHTML = '';
            items.forEach((item, index) => {
                const itemElement = document.createElement('li');
                itemElement.className = 'basket__item card card_compact';
                itemElement.innerHTML = `
                    <span class="basket__item-index">${index + 1}</span>
                    <span class="card__title">${item.title}</span>
                    <span class="card__price">${item.price} синапсов</span>
                    <button class="basket__item-delete" aria-label="удалить" data-id="${item.id}"></button>
                `;
                this._listElement.appendChild(itemElement);
            });
        }
    }

    updateTotal(total: number) {
        if (this._totalElement) {
            this._totalElement.textContent = `${total} синапсов`;
        }
    }
}