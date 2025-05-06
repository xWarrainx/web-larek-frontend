import './scss/styles.scss';
import { EventEmitter } from "./components/base/events";
import { LarekApi } from "./components/LarekApi";
import { AppData } from "./components/base/AppData";
import { IProduct } from "./types";
import { ApiListResponse } from "./components/base/api";
import { API_URL, CDN_URL } from "./utils/constants";
import { Card, CardPreview } from "./components/base/Card";
import { Modal, ModalType } from './components/base/Modal';
import { Basket } from './components/base/Basket';
import { OrderForm } from './components/base/OrderForm';
import { ContactsForm } from './components/base/ContactsForm';
import { Page } from './components/base/Page';
import { BasketItem } from './components/base/BasketItem';
import { SuccessView } from './components/base/SuccessView';

// Инициализация
const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);
const appData = new AppData(events);
const page = new Page(document.body, events);

// Получение модального окна
const modalContainer = document.getElementById('modal-container');
const modal = new Modal(modalContainer, events);

// Шаблоны
function getTemplate(id: string): HTMLTemplateElement {
    const template = document.getElementById(id);
    if (!(template instanceof HTMLTemplateElement)) {
        throw new Error(`Template ${id} not found`);
    }
    return template;
}

const templates = {
    cardPreview: getTemplate('card-preview'),
    card: getTemplate('card-catalog'),
    basket: getTemplate('basket'),
    order: getTemplate('order'),
    contacts: getTemplate('contacts'),
    success: getTemplate('success'),
    cardBasket: getTemplate('card-basket')
};

// Компоненты
const basketTemplate = templates.basket.content.firstElementChild?.cloneNode(true) as HTMLElement;
if (!basketTemplate) throw new Error('Basket template error');
const basket = new Basket(basketTemplate, events);

const orderTemplate = templates.order.content.firstElementChild?.cloneNode(true) as HTMLElement;
if (!orderTemplate) throw new Error('Order template is empty');
const orderForm = new OrderForm(orderTemplate, events);

const contactsTemplate = templates.contacts.content.firstElementChild?.cloneNode(true) as HTMLElement;
if (!contactsTemplate) throw new Error('Contacts template is empty');
const contactsForm = new ContactsForm(contactsTemplate, events);

const cardComponent = new Card(templates.card, events);
const preview = new CardPreview(templates.cardPreview, events, appData);
const successView = new SuccessView(modalContainer, events);

// Загрузка данных
api.getProductList()
    .then((response: ApiListResponse<IProduct>) => {
        appData.setCatalog(response.items);
    })
    .catch((error) => {
        console.error('Ошибка загрузки:', error);
        page.setError('Ошибка загрузки товаров');
    });

events.on('items:changed', (items: IProduct[]) => {
    const cards = items.map(item => {
        const card = cardComponent.render(item);
        card.addEventListener('click', () => events.emit('card:select', item));
        return card;
    });
    page.gallery = cards;
});

events.on('card:select', (item: IProduct) => {
    modal.render(preview.render(item));
    modal.open('preview' as ModalType);
});

events.on('basket:add', (product: IProduct) => {
    appData.addToBasket(product);
    events.emit('basket:changed');
});

events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
    events.emit('basket:changed');
});

events.on('basket:open', () => {
    modal.render(basket.getContainer());
    modal.open('basket' as ModalType);
});

events.on('basket:changed', () => {
    page.counter = appData.basket.length;

    // Создаём элементы через map
    const items = appData.basket.map((item, index) => {
        const itemElement = templates.cardBasket.content.firstElementChild?.cloneNode(true) as HTMLElement;
        if (!itemElement) throw new Error('Basket item template is empty');

        const basketItem = new BasketItem(itemElement, events);
        basketItem.render({...item, index: index + 1});
        return itemElement;
    });

    // Обновляем представление
    basket.list = items;
    basket.total = appData.getTotal();
});

events.on('order:open', () => {
    // Валидация при открытии
    const errors = appData.validateOrder();
    if (Object.keys(errors).length > 0) {
        orderForm.setErrors(errors);
    }

    modal.render(orderTemplate);
    modal.open('order' as ModalType);
});

events.on('order:paymentChange', (event: { value: string }) => {
    appData.setOrderField('payment', event.value);
    const errors = appData.validateOrder();
    events.emit('order:validated', {
        errors,
        isValid: appData.isOrderValid()
    });
});

events.on('order:addressChange', (event: { value: string }) => {
    appData.setOrderField('address', event.value);
    const errors = appData.validateOrder();
    events.emit('order:validated', {
        errors,
        isValid: appData.isOrderValid()
    });
});

events.on('order:submit', () => {
    if (appData.isOrderValid()) {
    modal.render(contactsTemplate);
    modal.open('contacts' as ModalType);
    }
});

events.on('order:reset', () => {
    contactsForm.reset();
});

events.on('contacts:emailChange', (event: { value: string }) => {
    appData.setOrderField('email', event.value);
    if (!contactsForm) return;

    const errors = appData.validateContacts();
    contactsForm.setErrors(errors);
    contactsForm.setValid(appData.isContactsValid());
});

events.on('contacts:phoneChange', (event: { value: string }) => {
    appData.setOrderField('phone', event.value);
    if (!contactsForm) return;

    const errors = appData.validateContacts();
    contactsForm.setErrors(errors);
    contactsForm.setValid(appData.isContactsValid());
});

events.on('contacts:submit', () => {
    if (appData.isContactsValid()) {
        api.orderProducts(appData.getOrderPayload())
            .then(() => {
                successView.render({ total: appData.getTotal() });
                modal.open('success' as ModalType);

                //Удаляем товары из корзины
                appData.resetAll();
            })
            .catch(error => {
                console.error('Order error:', error);
            });
    }
});

events.on('success:close', () => {
    modal.close();
    page.counter = 0;
});

events.on('modal:close', () => {
});