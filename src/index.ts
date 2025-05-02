import './scss/styles.scss';
import { EventEmitter } from "./components/base/events";
import { LarekApi } from "./components/LarekApi";
import { AppData } from "./components/base/AppData";
import { IProduct, IOrder } from "./types";
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

// Получаем DOM элементы
const galleryElement = document.querySelector('.gallery');
const basketCounter = document.querySelector('.header__basket-counter');
const basketButton = document.querySelector('.header__basket');
let orderForm: OrderForm;
let contactsForm: ContactsForm;

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
    basket.total = appData.getTotal();
    modal.render(basket.getContainer());
    modal.open();
});

events.on('basket:changed', (items: IProduct[]) => {
    basket.items = items;
    basket.total = appData.getTotal();
    updateBasketUI(items);
});

events.on('order:open', () => {
    const orderElement = createFromTemplate(orderTemplate);
    orderForm = new OrderForm(orderElement, events);
    modal.render(orderElement);
    modal.open();
});

events.on('order:submit', (data: { payment: string, address: string }) => {
    appData.setOrderField('payment', data.payment);
    appData.setOrderField('address', data.address);

    const errors = appData.validateOrder();
    if (appData.isOrderValid()) {
        const contactsElement = createFromTemplate(contactsTemplate);
        const contactsForm = new ContactsForm(contactsElement, events);
        modal.render(contactsElement);
    } else {
        const orderForm = new OrderForm(createFromTemplate(orderTemplate), events);
        orderForm.setErrors(errors);
        modal.render(orderForm.getContainer());
    }
});

events.on('order:fieldChange', (data: { field: 'payment' | 'address' | 'email' | 'phone', value: string }) => {
    appData.setOrderField(data.field, data.value);
});

events.on('order:paymentChange', (data: { value: string }) => {
    appData.setOrderField('payment', data.value);
});

events.on('order:addressChange', (data: { value: string }) => {
    appData.setOrderField('address', data.value);
});

events.on('contacts:open', () => {
    const contactsElement = createFromTemplate(contactsTemplate);
    contactsForm = new ContactsForm(contactsElement, events);
    modal.render(contactsElement);
    modal.open();
});

events.on('contacts:submit', () => {
    const errors = appData.validateContacts();
    if (appData.isContactsValid()) {
        api.orderProducts(appData.getOrderData()).then(() => {
            const successElement = createFromTemplate(successTemplate);
            const description = successElement.querySelector('.order-success__description');
            if (description) {
                description.textContent = `Списано ${appData.getTotal()} синапсов`;
            }

            const closeButton = successElement.querySelector('.order-success__close');
            closeButton?.addEventListener('click', () => {
                location.reload();
            });

            modal.render(successElement);
            modal.open();
            appData.clearBasket();
        }).catch((error) => {
            contactsForm.setError('Ошибка оформления заказа');
        });
    } else {
        contactsForm.setErrors(errors);
    }
});

events.on('contacts:emailChange', (data: { value: string }) => {
    appData.setOrderField('email', data.value);
});

events.on('contacts:phoneChange', (data: { value: string }) => {
    appData.setOrderField('phone', data.value);
});

function updateBasketUI(items: IProduct[] = []) {
    basketCounter.textContent = items.length.toString();
    basketCounter.classList.add('header__basket-counter--updated');
    setTimeout(() => {
        basketCounter.classList.remove('header__basket-counter--updated');
    }, 300);
}