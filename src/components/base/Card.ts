import { Component } from './Component';
import { IProduct } from '../../types';
import { EventEmitter } from './events';

export class Card extends Component<IProduct> {
    private clickHandler?: () => void;


    constructor(protected template: HTMLTemplateElement,
        protected events: EventEmitter,
        protected isPreview: boolean = false) {
        super(template.content.firstElementChild as HTMLElement);
    }

    render(product: IProduct): HTMLElement {
        // Удаляем старый обработчик, если есть
        if (this.clickHandler && this.container) {
            this.container.removeEventListener('click', this.clickHandler);
        }
        // Клонируем шаблон для каждого нового рендера
        const content = this.template.content.cloneNode(true) as DocumentFragment;
        this.container = content.firstElementChild as HTMLElement;

        if (!this.container) {
            throw new Error('Шаблон карточки пуст');
        }

        // Заполняем данные
        this.setText('.card__title', product.title);
        this.setText('.card__text', product.description || '');
        this.setText('.card__price',
            product.price !== null
                ? `${product.price} синапсов`
                : 'Бесценно');

        this.setImage('.card__image', product.image, product.title);

        // Устанавливаем категорию
        const categoryClass = {
            'софт-скил': 'card__category_soft',
            'другое': 'card__category_other',
            'дополнительное': 'card__category_additional',
            'кнопка': 'card__category_button',
            'хард-скил': 'card__category_hard'
        }[product.category] || '';

        this.setClass('.card__category', categoryClass);
        this.setText('.card__category', product.category || '');

        // Устанавливаем ID продукта
        if (product.id) {
            this.container.dataset.id = product.id;
        }

        this.clickHandler = () => {
            this.events.emit('card:select', product);
        };

        this.container.addEventListener('click', this.clickHandler);

        if (this.isPreview) {
            this.setText('.card__price',
                product.price !== null ? `${product.price} синапсов` : 'Бесценно');

            const button = this.container.querySelector('.card__button');
            if (button) {
                button.addEventListener('click', () => {
                    this.events.emit('basket:add', product);
                });
            }
        }

        return this.container;
    }
}

export class CardPreview extends Card {
    constructor(
        template: HTMLTemplateElement,
        events: EventEmitter
    ) {
        super(template, events, true);
    }
}

export function createProductCard(product: IProduct, inBasket: boolean): HTMLElement {
    const template = document.getElementById('card-template') as HTMLTemplateElement;
    const card = template.content.cloneNode(true) as HTMLElement;

    card.querySelector('.card__title').textContent = product.title;
    card.querySelector('.card__price').textContent = `${product.price} синапсов`;

    const button = card.querySelector('.card__button');
    button.textContent = inBasket ? 'Убрать' : 'Купить';

    return card.firstElementChild as HTMLElement;
  }