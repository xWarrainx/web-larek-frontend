import { Component } from "./Component";
import { EventEmitter } from "./events";
import { IProduct } from "../../types";
import { AppData } from "./AppData";

const categoryClasses: Record<string, string> = {
    'софт-скил': 'card__category_soft',
    'хард-скил': 'card__category_hard',
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button',
    'другое': 'card__category_other'
};

export class Card extends Component<IProduct> {
    protected template: HTMLTemplateElement;

    constructor(template: HTMLTemplateElement, events: EventEmitter) {
        // Создаем временный контейнер
        const tempContainer = document.createElement('div');
        super(tempContainer, events);
        this.template = template;
    }

    render(item: IProduct): HTMLElement {
        const element = this.template.content.querySelector('.card')?.cloneNode(true) as HTMLElement;

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
            Object.values(categoryClasses).forEach(className => {
                category.classList.remove(className);
            });
            const categoryClass = categoryClasses[item.category];
            if (categoryClass) {
                category.classList.add(categoryClass);
            }
        }

        return element;
    }
}

export class CardPreview extends Card {
    private _button: HTMLButtonElement | null = null;
    private _currentItem: IProduct | null = null;

    constructor(
        template: HTMLTemplateElement,
        events: EventEmitter,
        private appData: AppData
    ) {
        super(template, events);
        const element = template.content.querySelector('.card')?.cloneNode(true) as HTMLElement;
        if (!element) {
            throw new Error('Preview template content is empty');
        }

        this._button = element.querySelector('.card__button') as HTMLButtonElement;
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
        const element = super.render(item);
        this._currentItem = item;

        const text = element.querySelector('.card__text');
        if (text) text.textContent = item.description || 'Описание отсутствует';

        const title = element.querySelector('.card__title');
        if (title) title.textContent = item.title;

        const image = element.querySelector('.card__image') as HTMLImageElement;
        if (image && item.image) image.src = item.image;

        const price = element.querySelector('.card__price');
        if (price) {
            price.textContent = item.price ? `${item.price} синапсов` : 'Бесценно';
        }

        const category = element.querySelector('.card__category');
        if (category && item.category) {
            category.textContent = item.category;
            Object.values(categoryClasses).forEach(className => {
                category.classList.remove(className);
            });
            const categoryClass = categoryClasses[item.category];
            if (categoryClass) {
                category.classList.add(categoryClass);
            }
        }

        this._button = element.querySelector('.card__button');

        if (this._button) {
            this.updateButtonState();
            this._button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleBasket();
            });
        }
        return element;
    }

    private toggleBasket(): void {
        if (!this._currentItem || !this._button) return;
        if (this.appData.isInBasket(this._currentItem)) {
            this.events.emit('basket:remove', { id: this._currentItem.id });
            this._button.textContent = 'В корзину';
        } else {
            this.events.emit('basket:add', this._currentItem);
                if (this._button && this._currentItem) {
                    this.updateButtonState();
                }
        }
    }
    private updateButtonState(): void {
        if (!this._currentItem || !this._button) return;

        const inBasket = this.appData.isInBasket(this._currentItem);
        this._button.textContent = inBasket ? 'Удалить из корзины' : 'В корзину';
        this._button.disabled = !this._currentItem.price;
    }
}