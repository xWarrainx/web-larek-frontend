import './scss/styles.scss'; // Импорт главного файла стилей
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
const modal = new Modal(document.getElementById('modal-container'), events);

// Обработчик выбора карточки
events.on('card:select', (item: IProduct) => {
    const preview = new CardPreview(previewTemplate, events);
    const previewElement = preview.render(item);
    modal.open(previewElement);
});

events.on('basket:add', (product: IProduct) => {
    appData.addToBasket(product);
    modal.close();
});

// Получаем DOM элементы
const galleryElement = document.querySelector('.gallery');
const cardTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;

// Проверяем наличие элементов
if (!galleryElement || !cardTemplate || !previewTemplate) {
    throw new Error('Не найдены необходимые DOM элементы');
}

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

// Обработчик изменения списка товаров
events.on('items:changed', (items: IProduct[]) => {
    renderCatalog(items);
});

// Обработчик превью товара
events.on('card:select', (item: IProduct) => {
    const preview = new CardPreview(previewTemplate, events);
    const previewElement = preview.render(item);
    modal.open(previewElement);
});

// Обработчик добавления в корзину товара
events.on('basket:add', (product: IProduct) => {
    appData.addToBasket(product);
    modal.close();
});

// Функция рендеринга каталога
function renderCatalog(items: IProduct[]) {
    // Очищаем галерею
    galleryElement.innerHTML = '';

    // Проверяем входные данные
    if (!items || !Array.isArray(items)) {
        console.error('Некорректные данные для рендеринга:', items);
        galleryElement.innerHTML = '<p class="empty">Нет данных для отображения</p>';
        return;
    }

    if (items.length === 0) {
        galleryElement.innerHTML = '<p class="empty">Товары не найдены</p>';
        return;
    }

    // Рендерим каждую карточку
    items.forEach(item => {
        const cardElement = cardComponent.render(item);
        cardElement.addEventListener('click', () => {
            events.emit('card:select', item);
        });
        galleryElement.appendChild(cardElement);
    });
}

// Обработчик выбора карточки
events.on('card:select', (item: IProduct) => {
    console.log('Выбран товар:', item);
    // Здесь будет логика открытия модального окна
});

// Подписка на события
events.on('basket:changed', (order) => {
    console.log('Обновление корзины:', order);
    // Обновляем UI корзины
});
