import { Component } from "./Component";
import { EventEmitter } from "./events";
import { IProduct } from "../../types";
import { AppData } from "./AppData";

// Классы CSS для разных категорий товаров
const CATEGORY_CLASSES: Record<string, string> = {
    'софт-скил': 'card__category_soft',
    'хард-скил': 'card__category_hard',
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button',
    'другое': 'card__category_other'
};

export class Card extends Component<IProduct> {
    protected template: HTMLTemplateElement;
    protected element: HTMLElement | null = null;

    constructor(template: HTMLTemplateElement, events: EventEmitter) {
        super(document.createElement('div'), events);
        this.template = template;
    }

    protected createBaseElement(item: IProduct): HTMLElement {
        const element = this.template.content.querySelector('.card')?.cloneNode(true) as HTMLElement;
        if (!element) throw new Error('Card template is empty');

        this.updateTextContent(element, '.card__title', item.title);
        this.updateImageSource(element, '.card__image', item.image);
        this.updatePrice(element, '.card__price', item.price);
        this.updateCategory(element, '.card__category', item.category);

        return element;
    }

    render(item: IProduct): HTMLElement {
        this.element = this.createBaseElement(item);
        return this.element;
    }

    protected updateTextContent(parent: HTMLElement, selector: string, value?: string): void {
        const element = parent.querySelector(selector);
        if (element && value) element.textContent = value;
    }

    protected updateImageSource(parent: HTMLElement, selector: string, src?: string): void {
        const image = parent.querySelector(selector) as HTMLImageElement;
        if (image && src) image.src = src;
    }

    protected updatePrice(parent: HTMLElement, selector: string, price?: number | null): void {
        const element = parent.querySelector(selector);
        if (element) {
            element.textContent = price ? `${price} синапсов` : 'Бесценно';
        }
    }

    protected updateCategory(parent: HTMLElement, selector: string, category?: string): void {
        const element = parent.querySelector(selector);
        if (element && category) {
            element.textContent = category;
            Object.values(CATEGORY_CLASSES).forEach(className => {
                element.classList.remove(className);
            });
            const categoryClass = CATEGORY_CLASSES[category];
            if (categoryClass) element.classList.add(categoryClass);
        }
    }
}

export class CardPreview extends Card {
    private button: HTMLButtonElement | null = null;
    private currentItem: IProduct | null = null;

    constructor(
        template: HTMLTemplateElement,
        events: EventEmitter,
        private appData: AppData
    ) {
        super(template, events);
        events.on('basket:changed', () => this.updateButtonState());
    }

    render(item: IProduct): HTMLElement {
        this.currentItem = item;
        this.element = this.createBaseElement(item);

        this.updateTextContent(this.element, '.card__text', item.description || 'Описание отсутствует');
        this.setupButton();

        return this.element;
    }

    private setupButton(): void {
        if (!this.element) return;

        this.button = this.element.querySelector('.card__button');
        if (!this.button || !this.currentItem) return;

        this.updateButtonState();

        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleBasket();
        });
    }

    private toggleBasket(): void {
        if (!this.currentItem || !this.button) return;

        if (this.appData.isInBasket(this.currentItem)) {
            this.events.emit('basket:remove', { id: this.currentItem.id });
        } else {
            this.events.emit('basket:add', this.currentItem);
        }

        this.updateButtonState();
    }

    private updateButtonState(): void {
        if (!this.button || !this.currentItem) return;

        const inBasket = this.appData.isInBasket(this.currentItem);
        this.button.textContent = inBasket ? 'Удалить из корзины' : 'В корзину';
        this.button.disabled = !this.currentItem.price;
    }
}