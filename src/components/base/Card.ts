import { Component } from './Component';
import { IProduct } from '../../types';
import { IEvents } from './events';

export class Card extends Component<IProduct> {
    constructor(template: HTMLTemplateElement, events: IEvents) {
        super(template);
    }

    render(product: IProduct): HTMLElement {
        this.setText('.card__title', product.title);
        this.setText('.card__text', product.description);
        this.setText('.card__price',
            product.price !== null
                ? `${product.price} синапсов`
                : 'Бесценно');

        this.setImage('.card__image', product.image, product.title);

        const categoryClass = {
            'софт-скил': 'card__category_soft',
            'другое': 'card__category_other',
            'дополнительное': 'card__category_additional',
            'кнопка': 'card__category_button',
            'хард-скил': 'card__category_hard'
          }[product.category] || '';

        this.setClass('.card__category', categoryClass);
        this.setText('.card__category', product.category);

        const card = this.container.firstElementChild as HTMLElement;
        card.dataset.id = product.id;

        return card;
    }
}