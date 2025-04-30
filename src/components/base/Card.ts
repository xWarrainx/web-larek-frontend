import { EventEmitter } from "./events";
import { IProduct } from "../../types";

export class Card {
    protected _template: HTMLTemplateElement;
    protected _events: EventEmitter;
    protected _categoryClasses: Record<string, string>;

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

        const title = element.querySelector('.card__title');
        const image = element.querySelector('.card__image') as HTMLImageElement;
        const price = element.querySelector('.card__price');
        const category = element.querySelector('.card__category');

        if (title) title.textContent = item.title;
        if (image && item.image) image.src = item.image;
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

        return element;
    }
}

export class CardPreview extends Card {
    constructor(template: HTMLTemplateElement, events: EventEmitter) {
        super(template, events);
    }

    render(item: IProduct): HTMLElement {
        const element = this._template.content.querySelector('.card')?.cloneNode(true) as HTMLElement;

        const title = element.querySelector('.card__title');
        const image = element.querySelector('.card__image') as HTMLImageElement;
        const price = element.querySelector('.card__price');
        const category = element.querySelector('.card__category');
        const text = element.querySelector('.card__text');
        const button = element.querySelector('.card__button') as HTMLButtonElement;

        if (title) title.textContent = item.title;
        if (image && item.image) image.src = item.image;
        if (price) {
            price.textContent = item.price ? `${item.price} синапсов` : 'Бесценно';
        }
        if (text) text.textContent = item.description || 'Описание отсутствует';

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
            button.textContent = item.price ? 'В корзину' : 'Не продаётся';
            button.disabled = !item.price;

            if (item.price) {
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    button.textContent = 'Добавлено!';
                    setTimeout(() => {
                        this._events.emit('basket:add', item);
                    }, 300);
                });
            }
        }

        return element;
    }
}