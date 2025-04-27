import './scss/styles.scss';
import { EventEmitter } from "./components/base/events";
import { LarekApi } from "./components/LarekApi";
import { AppData } from "./components/base/AppData";
import { IProduct, IOrderForm } from "./types";
import { ApiListResponse } from "./components/base/api";
import { API_URL, CDN_URL } from "./utils/constants";
import { Card, CardPreview } from "./components/base/Card";
import { Modal } from './components/base/Modal';
import { Basket } from './components/base/Basket';
import { OrderForm } from './components/base/OrderForm';

// Инициализация основных компонентов
const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);
const appData = new AppData(events);

// Получаем шаблоны
const previewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;
const cardTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;
const successTemplate = document.getElementById('success') as HTMLTemplateElement;

// Проверка шаблонов
if (!previewTemplate || !cardTemplate || !basketTemplate || !orderTemplate || !contactsTemplate || !successTemplate) {
    throw new Error('One or more templates not found');
}

const modal = new Modal(document.getElementById('modal-container'), events);

// Получаем DOM элементы
const galleryElement = document.querySelector('.gallery');
const basketCounter = document.querySelector('.header__basket-counter');
const basketButton = document.querySelector('.header__basket');

if (!galleryElement || !basketCounter || !basketButton) {
    throw new Error('Required DOM elements not found');
}

// Инициализация форм
const orderFormContainer = orderTemplate.content.cloneNode(true) as HTMLElement;
const orderForm = new OrderForm(orderFormContainer, events, 'order');

const contactsFormContainer = contactsTemplate.content.cloneNode(true) as HTMLElement;
const contactsForm = new OrderForm(contactsFormContainer, events, 'contacts');

// Инициализация компонентов
const cardComponent = new Card(cardTemplate, events);
const basketComponent = new Basket(basketTemplate, events);

// Загрузка данных с сервера
api.getProductList()
    .then((response: ApiListResponse<IProduct>) => {
        appData.catalog = response.items;
        events.emit('items:changed', appData.catalog);
    })
    .catch((error: Error) => {
        console.error('Ошибка загрузки товаров:', error);
        galleryElement.innerHTML = '<p class="error">Произошла ошибка при загрузке товаров</p>';
    });

// Обработчики событий
basketButton.addEventListener('click', () => {
    events.emit('basket:open');
});

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

events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
});

events.on('basket:open', () => {
    const basketElement = basketComponent.render({
        items: appData.basket,
        total: appData.getOrderTotal()
    });
    modal.open(basketElement);
});

events.on('order:open', () => {
    modal.open(orderForm.getContainer());
});

events.on('order:submit', () => {
    const orderData = orderForm.getFormData();
    appData.order.payment = orderData.payment;
    appData.order.address = orderData.address;

    modal.open(contactsForm.getContainer());
});

events.on('contacts:submit', () => {
    const contactsData = contactsForm.getFormData();
    appData.order.email = contactsData.email;
    appData.order.phone = contactsData.phone;
    appData.order.total = appData.getOrderTotal();

    api.orderProducts(appData.order)
        .then(() => {
            const successContainer = successTemplate.content.cloneNode(true) as HTMLElement;
            const successDescription = successContainer.querySelector('.order-success__description');
            if (successDescription) {
                successDescription.textContent = `Списано ${appData.order.total} синапсов`;
            }

            const closeButton = successContainer.querySelector('.order-success__close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    modal.close();
                    appData.clearBasket();
                });
            }

            modal.open(successContainer);
        })
        .catch(error => {
            console.error('Ошибка оформления заказа:', error);
            contactsForm.setText('.form__errors', 'Ошибка оформления заказа');
        });
});

// Функции рендеринга
function renderCatalog(items: IProduct[]) {
    galleryElement.innerHTML = '';

    if (!items || items.length === 0) {
        galleryElement.innerHTML = '<p class="empty">Товары не найдены</p>';
        return;
    }

    items.forEach(item => {
        const cardElement = cardComponent.render(item);
        cardElement.addEventListener('click', () => {
            events.emit('card:select', item);
        });
        galleryElement.appendChild(cardElement);
    });
}

function updateBasketUI(items: IProduct[]) {
    basketCounter.textContent = items.length.toString();
    basketCounter.classList.add('header__basket-counter--updated');
    setTimeout(() => {
        basketCounter.classList.remove('header__basket-counter--updated');
    }, 300);
}