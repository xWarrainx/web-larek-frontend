import { EventEmitter } from "./events";
import { IProduct } from "../../types";

export class Card {
    protected _template: HTMLTemplateElement;
    protected _events: EventEmitter;
    private _categoryClasses: Record<string, string>;

    constructor(template: HTMLTemplateElement, events: EventEmitter) {
        this._template = template;
        this._events = events;
        this._categoryClasses = {
            'софт-скил': 'card__category_soft',
            'хард-скил': 'card__category_hard',
            'дополнительное': 'card__category_additional',
            'кнопка': 'card__category_button',
            'другое': 'card__category_other'
        };
    }

    render(item: IProduct): HTMLElement {
        const element = this._template.content.querySelector('.card')?.cloneNode(true) as HTMLElement;
        if (!element) throw new Error('Card element not found in template');

        const title = element.querySelector('.card__title');
        const image = element.querySelector('.card__image') as HTMLImageElement;
        const price = element.querySelector('.card__price');
        const button = element.querySelector('.card__button');
        const category = element.querySelector('.card__category');

        if (title) title.textContent = item.title;
        if (image) image.src = item.image;
        if (price) {
            price.textContent = item.price ? `${item.price} синапсов` : 'Бесценно';
        }

        if (category && item.category) {
            category.textContent = item.category;
            Object.values(this._categoryClasses).forEach(className => {
                category.classList.remove(className);
            });
            const categoryClass = this._categoryClasses[item.category];
            if (categoryClass) {
                category.classList.add(categoryClass);
            }
        }

        if (button) {
            button.replaceWith(button.cloneNode(true));
            const newButton = element.querySelector('.card__button') as HTMLButtonElement;

            if (newButton) {
                newButton.textContent = item.price ? 'В корзину' : 'Не продаётся';

                // Исправленная строка с приведением типа
                if (item.price) {
                    newButton.disabled = false;
                    newButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        this._events.emit('basket:add', item);
                    });
                } else {
                    newButton.disabled = true;
                }
            }
        }

        return element;
    }
}

export class CardPreview extends Card {
    constructor(template: HTMLTemplateElement, events: EventEmitter) {
        super(template, events);
    }

    render(item: IProduct): HTMLElement {
        const element = super.render(item);
        const description = element.querySelector('.card__description');
        const button = element.querySelector('.card__button') as HTMLButtonElement;

        if (description) description.textContent = item.description || 'Описание отсутствует';

        if (button && item.price) {
            button.textContent = 'В корзину';
            button.replaceWith(button.cloneNode(true));
            const newButton = element.querySelector('.card__button') as HTMLButtonElement;

            if (newButton) {
                newButton.disabled = false;
                newButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this._events.emit('basket:add', item);
                });
            }
        } else if (button) {
            button.disabled = true;
        }

        return element;
    }
}