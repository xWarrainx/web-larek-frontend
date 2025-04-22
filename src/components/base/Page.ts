import { LarekApi } from '../LarekApi';
import { Card } from './Card';
import { IProduct } from '../../types';
import { Modal } from './Modal';

export class Page {
    private cards: Card[] = [];
    private gallery: HTMLElement;
    private cardTemplate: HTMLTemplateElement;

    constructor(
        private api: LarekApi,
        private modal: Modal
    ) {
        this.gallery = document.querySelector('.gallery')!;
        this.cardTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
    }

    renderProducts(): void {
        this.api.getProductList()
            .then((response: { items: IProduct[] }) => {
                this.gallery.innerHTML = '';
                this.cards = response.items.map(item => {
                    const card = new Card(this.cardTemplate, this.modal);
                    const cardElement = card.render(item);
                    this.gallery.appendChild(cardElement);
                    return card;
                });
            })
            .catch(() => {
                this.showError('Не удалось загрузить товары');
            });
    }

    private showError(message: string): void {
        this.gallery.innerHTML = `<div class="error">${message}</div>`;
    }
}