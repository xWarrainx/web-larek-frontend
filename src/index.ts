import './scss/styles.scss';
import { EventEmitter } from "./components/base/events";
import { LarekApi } from "./components/LarekApi";
import { AppData } from "./components/base/AppData";
import { IProduct } from "./types";
import { ApiListResponse } from "./components/base/api";
import { API_URL, CDN_URL } from "./utils/constants";
import { Card, CardPreview } from "./components/base/Card";
import { Modal } from './components/base/Modal';

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

// Инициализация компонента карточки
const cardComponent = new Card(cardTemplate, events);

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

// Обработчики событий (без дублирования)
events.on('items:changed', (items: IProduct[]) => {
    renderCatalog(items);
});

events.on('card:select', (item: IProduct) => {
    const preview = new CardPreview(previewTemplate, events);
    const previewElement = preview.render(item);
    modal.open(previewElement);
});

events.on('basket:add', (product: IProduct) => {
    // Проверяем, нет ли уже этого товара в корзине
    if (!appData.basket.some(item => item.id === product.id)) {
        appData.addToBasket(product);
        modal.close();
    }
});

events.on('basket:changed', (items: IProduct[]) => {
    console.log('Корзина обновлена:', items);
    // Обновляем UI корзины
    updateBasketUI(items);
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
    const basketCounter = document.querySelector('.basket__counter');
    const basketTotal = document.querySelector('.basket__total');

    if (basketCounter) {
        basketCounter.textContent = items.length.toString();
    }

    if (basketTotal) {
        const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
        basketTotal.textContent = `${total} синапсов`;
    }
}