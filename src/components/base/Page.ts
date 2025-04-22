import { Card } from "./Card";
import { LarekApi } from "../LarekApi";
import { IEvents } from "./events";

export class Page {
    private cards: Card[] = [];
    private api: LarekApi;
    private gallery: HTMLElement;
    private cardTemplate: HTMLTemplateElement;
    private events: IEvents;

    constructor(api: LarekApi, events: IEvents) {
        this.api = api;
        this.events = events;
        this.gallery = document.querySelector('.gallery') as HTMLElement;
        this.cardTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
    }

    renderProducts() {
        this.api.getProductList()
            .then((response: { items: any[] }) => {
                this.gallery.innerHTML = '';
                this.cards = response.items.map(item => {
                    const card = new Card(this.cardTemplate, this.events);
                    const cardElement = card.render(item);
                    this.gallery.appendChild(cardElement);
                    return card;
                });
            })
            .catch((error: Error) => {
                this.showError('Не удалось загрузить товары');
                console.error('Ошибка загрузки товаров:', error);
            });
    }

    private showError(message: string) {
        this.gallery.innerHTML = `<div class="error">${message}</div>`;
    }
}