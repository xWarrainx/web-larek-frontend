import './scss/styles.scss';
import { EventEmitter } from "./components/base/events";
import { LarekApi } from "./components/LarekApi";
import { AppData } from "./components/base/AppData";
import { IProduct } from "./types";
import { ApiListResponse } from "./components/base/api";
import { API_URL, CDN_URL } from "./utils/constants";
import { Card, CardPreview } from "./components/base/Card";
import { Modal } from './components/base/Modal';
import { Basket } from './components/base/Basket';

// Инициализация основных компонентов
const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);
const appData = new AppData(events);

const previewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;
if (!previewTemplate) throw new Error('Preview template not found');

const modal = new Modal(document.getElementById('modal-container'), events);

// Получаем DOM элементы
const galleryElement = document.querySelector('.gallery');
if (!galleryElement) throw new Error('Gallery element not found');

const cardTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
if (!cardTemplate) throw new Error('Card template not found');

const basketCounter = document.querySelector('.header__basket-counter');
if (!basketCounter) throw new Error('Basket counter element not found');

const basketButton = document.querySelector('.header__basket');
if (!basketButton) throw new Error('Basket button not found');

const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
if (!basketTemplate) throw new Error('Basket template not found');

// Инициализация компонента карточки
const cardComponent = new Card(cardTemplate, events);
const basketComponent = new Basket(basketTemplate, events);

// Загрузка данных с сервера
api.getProductList()
    .then((response: ApiListResponse<IProduct>) => {
        console.log('Получены товары:', response.items);
        appData.catalog = response.items;
    })
    .catch((error: Error) => {
        console.error('Ошибка загрузки товаров:', error);
        galleryElement.innerHTML = '<p class="error">Произошла ошибка при загрузке товаров</p>';
    });

    // Обработчик клика по корзине в хедере
basketButton.addEventListener('click', (event) => {
    event.preventDefault();
    events.emit('basket:open');
});

// Обработчик открытия корзины
events.on('basket:open', () => {
    const basketElement = basketComponent.render({
        items: appData.basket,
        total: appData.getOrderTotal()
    });
    modal.open(basketElement);
});

// Обработчики событий
events.on('items:changed', (items: IProduct[]) => {
    renderCatalog(items);
});

events.on('card:select', (item: IProduct) => {
    const preview = new CardPreview(previewTemplate, events);
    const previewElement = preview.render(item);
    modal.open(previewElement);
});

events.on('basket:add', (product: IProduct) => {
    appData.addToBasket(product);
    modal.close();
});

events.on('basket:changed', (items: IProduct[]) => {
    updateBasketUI(items);
    if (modal.isOpened()) {
        const basketElement = basketComponent.render({
            items: appData.basket,
            total: appData.getOrderTotal()
        });
        modal.open(basketElement);
    }
});

events.on('basket:cleared', () => {
    basketCounter.textContent = '0';
});

// В обработчике basket:remove
events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
});

// В обработчике order:open
events.on('order:open', () => {
    // Логика открытия формы заказа
});

// Функция рендеринга каталога
function renderCatalog(items: IProduct[]) {
    if (!galleryElement) return;

    galleryElement.innerHTML = '';

    if (!items || !Array.isArray(items)) {
        console.error('Некорректные данные для рендеринга:', items);
        galleryElement.innerHTML = '<p class="empty">Нет данных для отображения</p>';
        return;
    }

    if (items.length === 0) {
        galleryElement.innerHTML = '<p class="empty">Товары не найдены</p>';
        return;
    }

    items.forEach(item => {
        try {
            const cardElement = cardComponent.render(item);
            cardElement.addEventListener('click', () => {
                events.emit('card:select', item);
            });
            galleryElement.appendChild(cardElement);
        } catch (error) {
            console.error('Ошибка рендеринга карточки:', error);
        }
    });
}

// Функция обновления UI корзины
function updateBasketUI(items: IProduct[]) {
    // Обновляем счетчик в хедере
    basketCounter.textContent = items.length.toString();
    basketCounter.classList.add('header__basket-counter--updated');
    setTimeout(() => {
        basketCounter.classList.remove('header__basket-counter--updated');
    }, 300);
}