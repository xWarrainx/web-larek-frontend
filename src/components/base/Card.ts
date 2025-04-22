import { Component } from './Component';
import { IProduct } from '../../types';
import { Modal } from './Modal';

export class Card extends Component<IProduct> {
    constructor(
        template: HTMLTemplateElement,
        private modal: Modal
    ) {
        super(template);
    }

    render(product: IProduct): HTMLElement {
        // Заполняем основные данные
        this.setText('.card__title', product.title);
        this.setText('.card__text', product.description || '');
        this.setText('.card__price',
            product.price !== null
                ? `${product.price} синапсов`
                : 'Бесценно');

        this.setImage('.card__image', product.image, product.title);
        this.setText('.card__category', product.category);

        const categoryClass = {
            'софт-скил': 'card__category_soft',
            'другое': 'card__category_other',
            'дополнительное': 'card__category_additional',
            'кнопка': 'card__category_button',
            'хард-скил': 'card__category_hard'
          }[product.category] || '';
        this.setClass('.card__category', categoryClass);

        // Настройка клика для открытия в модалке
        const cardElement = this.container.firstElementChild as HTMLElement;
        cardElement.addEventListener('click', () => {
            this.openProductModal(product);
        });

        return cardElement;
    }

    private openProductModal(product: IProduct): void {
        const previewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;
        const preview = previewTemplate.content.cloneNode(true) as HTMLElement;

        // Создаем временный компонент для заполнения превью
        const tempContainer = document.createElement('div');
        tempContainer.appendChild(preview);

        // Заполняем данные для превью
        this.fillPreviewContent(tempContainer, product);
        this.modal.open(tempContainer.firstElementChild as HTMLElement);
    }

    private fillPreviewContent(context: HTMLElement, product: IProduct): void {
        const setText = (selector: string, value: string) => {
            const element = context.querySelector(selector);
            if (element) element.textContent = value;
        };

        const setImage = (selector: string, src: string, alt?: string) => {
            const element = context.querySelector(selector) as HTMLImageElement;
            if (element) {
                element.src = src;
                if (alt) element.alt = alt;
            }
        };

        setText('.card__title', product.title);
        setText('.card__text', product.description || '');
        setText('.card__price',
            product.price !== null
                ? `${product.price} синапсов`
                : 'Бесценно');
        setImage('.card__image', product.image, product.title);
        setText('.card__category', product.category);
    }
}