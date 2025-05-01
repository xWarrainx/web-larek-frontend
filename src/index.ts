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
import { OrderForm } from './components/base/OrderForm';
import { ContactsForm } from './components/base/ContactsForm';

// Инициализация основных компонентов
const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);
const appData = new AppData(events);

// Получаем шаблоны
const cardPreviewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;
const cardTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;
const successTemplate = document.getElementById('success') as HTMLTemplateElement;

const basketElement = createFromTemplate(basketTemplate);
const cardTemplateElement = createFromTemplate(cardTemplate);
const cardPreviewElement = createFromTemplate(cardPreviewTemplate);
const orderFormElement = createFromTemplate(orderTemplate);
const contactsFormElement = createFromTemplate(contactsTemplate);

// Инициализация компонентов
const modalContainer = document.getElementById('modal-container')!;
const modal = new Modal(modalContainer, events);

const basket = new Basket(createFromTemplate(basketTemplate), events);
const cardComponent = new Card(cardTemplate, events);
const preview = new CardPreview(cardPreviewTemplate, events, appData);
const orderForm = new OrderForm(orderFormElement, events);
const contactsForm = new ContactsForm(contactsFormElement, events);

// Получаем DOM элементы
const galleryElement = document.querySelector('.gallery');
const basketCounter = document.querySelector('.header__basket-counter');
const basketButton = document.querySelector('.header__basket');

// Функция для создания элемента из шаблона
function createFromTemplate(template: HTMLTemplateElement): HTMLElement {
    return template.content.firstElementChild!.cloneNode(true) as HTMLElement;
}

// Загрузка данных с сервера
api.getProductList()
    .then((response: ApiListResponse<IProduct>) => {
        appData.catalog = response.items;
        renderCatalog(appData.catalog);
    })
    .catch((error: Error) => {
        console.error('Ошибка загрузки:', error);
        galleryElement.innerHTML = '<p class="error">Ошибка загрузки товаров</p>';
    });

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

// Обработчики событий
basketButton.addEventListener('click', () => {
    events.emit('basket:open');
});

events.on('items:changed', renderCatalog);

events.on('card:select', (item: IProduct) => {
    modal.render(preview.render(item));
    modal.open();
})

events.on('basket:add', (product: IProduct) => {
    appData.addToBasket(product);
    events.emit('basket:changed', appData.basket);
});

events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
    events.emit('basket:changed', appData.basket);
});

events.on('basket:open', () => {
    basket.items = appData.basket;
    basket.total = appData.getOrderTotal();
    modal.render(basket.getContainer());
    modal.open();
});

events.on('basket:changed', (items: IProduct[]) => {
    basket.items = items;
    basket.total = appData.getOrderTotal();
    updateBasketUI(items);
});

events.on('order:open', () => {
    const orderElement = createFromTemplate(orderTemplate);
    const orderForm = new OrderForm(orderElement, events);
    modal.render(orderElement);
    modal.open();
});

events.on('order:submit', (data: { payment: string, address: string }) => {
    appData.order.payment = data.payment;
    appData.order.address = data.address;
    const contactsElement = createFromTemplate(contactsTemplate);
    const contactsForm = new ContactsForm(contactsElement, events);
    modal.render(contactsElement);
    modal.open();
});

events.on('contacts:open', () => {
    const contactsElement = createFromTemplate(contactsTemplate);
    const contactsForm = new ContactsForm(contactsElement, events);
    modal.render(contactsForm.getContainer());
    modal.open();
});

events.on('contacts:submit', (data: { email: string; phone: string }) => {
    appData.order.email = data.email;
    appData.order.phone = data.phone;

    api.orderProducts({
        ...appData.order,
        items: appData.basket.map(item => item.id),
        total: appData.getOrderTotal()
    }).then(() => {
        const successElement = createFromTemplate(successTemplate);
        const description = successElement.querySelector('.order-success__description');
        if (description) {
            description.textContent = `Списано ${appData.order.total} синапсов`;
        }

        modal.render(successElement);
        modal.open();
    }).catch((error) => {
        console.error('Ошибка оформления заказа:', error);
        contactsForm.setError('Ошибка оформления заказа');
    });
});

function updateBasketUI(items: IProduct[] = []) {
    basketCounter.textContent = items.length.toString();
    basketCounter.classList.add('header__basket-counter--updated');
    setTimeout(() => {
        basketCounter.classList.remove('header__basket-counter--updated');
    }, 300);
}