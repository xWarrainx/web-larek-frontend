import { EventEmitter } from "./events";
import { IProduct } from "../../types";
import { AppData } from "./AppData";

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
    protected _element: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _inBasket: boolean = false;
    protected _currentItem: IProduct | null = null;

    constructor(
        protected template: HTMLTemplateElement,
        protected events: EventEmitter,
        protected appData: AppData
    ) {
        super(template, events);

        this._element = template.content.querySelector('.card')?.cloneNode(true) as HTMLElement;
        if (!this._element) {
            throw new Error('Preview template content is empty');
        }

        this._button = this._element.querySelector('.card__button') as HTMLButtonElement;
        if (!this._button) {
            throw new Error('Button .card__button not found in preview template');
        }

        this._button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleBasket();
        });

        events.on('basket:changed', () => this.updateButtonState());
    }

    render(item: IProduct): HTMLElement {
        this._currentItem = item;

        const title = this._element.querySelector('.card__title');
        const image = this._element.querySelector('.card__image') as HTMLImageElement;
        const price = this._element.querySelector('.card__price');
        const category = this._element.querySelector('.card__category');
        const text = this._element.querySelector('.card__text');

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

        this.updateButtonState();

        if (this._button) {
            this._button.textContent = item.price ? 'В корзину' : 'Не продаётся';
            this._button.disabled = !item.price;
        }

        return this._element;
    }

    private toggleBasket() {
        if (!this._currentItem) return;

        if (this._inBasket) {
            this.events.emit('basket:remove', { id: this._currentItem.id });
        } else {
            this.events.emit('basket:add', this._currentItem);
        }
    }

    private updateButtonState() {
        if (!this._currentItem || !this._button) return;

        this._inBasket = this.appData.isInBasket(this._currentItem);
        this._button.textContent = this._inBasket ? 'Удалить из корзины' : 'В корзину';
    }
}