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
if (!modalContainer) throw new Error('Modal container not found');
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
const basket = new Basket(templates.basket, events);
const cardComponent = new Card(templates.card, events);
const preview = new CardPreview(templates.cardPreview, events, appData);
const successView = new SuccessView(modalContainer, events);

// Загрузка данных
api.getProductList()
    .then((response: ApiListResponse<IProduct>) => {
        appData.catalog = response.items;
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
});

events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
    events.emit('basket:changed');

    if (modal.isOpened()) {
        // Получаем текущий элемент модального окна
        const basketElement = modal.getContainer().querySelector('.basket');
        if (basketElement) {
            // Обновляем только список товаров и сумму
            const basketList = basketElement.querySelector('.basket__list');
            const totalElement = basketElement.querySelector('.basket__price');

            if (basketList && totalElement) {
                basketList.innerHTML = '';
                appData.basket.forEach((item, index) => {
                    const itemElement = templates.cardBasket.content.firstElementChild?.cloneNode(true) as HTMLElement;
                    if (itemElement) {
                        const basketItem = new BasketItem(itemElement, events);
                        basketItem.render({
                            ...item,
                            index: index + 1
                        });
                        basketList.appendChild(itemElement);
                    }
                });
                totalElement.textContent = `${appData.getTotal()} синапсов`;
            }
        }
    }
});

events.on('basket:open', () => {
    const basketElement = templates.basket.content.firstElementChild?.cloneNode(true) as HTMLElement;

    const basketView = new Basket(basketElement, events);

    // Заполняем корзину
    const basketList = basketElement.querySelector('.basket__list');
    if (!basketList) throw new Error('Basket list not found');

    const items = appData.basket.map((item, index) => {
        const itemElement = templates.cardBasket.content.firstElementChild?.cloneNode(true) as HTMLElement;
        if (!itemElement) throw new Error('Basket item template is empty');

        const basketItem = new BasketItem(itemElement, events);
        basketItem.render({...item, index: index + 1});
        return itemElement;
    });

    basketView.items = items;
    basketView.total = appData.getTotal();

    // Обработчик кнопки "Оформить"
    const checkoutButton = basketElement.querySelector('.basket__button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            modal.close();
            events.emit('order:open');
        });
    }

    modal.render(basketElement);
    modal.open('basket' as ModalType);
});

events.on('basket:changed', () => {
    // Обновляем список через Basket
    const items = appData.basket.map((item, index) => {
        const itemElement = templates.cardBasket.content.firstElementChild?.cloneNode(true) as HTMLElement;
        if (!itemElement) throw new Error('Basket item template is empty');

        const basketItem = new BasketItem(itemElement, events);
        return basketItem.render({
            ...item,
            index: index + 1
        });
    });

    basket.items = items;
    basket.total = appData.getTotal();
    page.counter = appData.basket.length;
});

events.on('order:open', () => {
    const orderElement = templates.order.content.firstElementChild?.cloneNode(true) as HTMLElement;
    if (!orderElement) throw new Error('Order template is empty');

    const orderForm = new OrderForm(orderElement, events);

    // Валидация при открытии
    const errors = appData.validateOrder();
    if (Object.keys(errors).length > 0) {
        orderForm.setErrors(errors);
    }

    modal.render(orderElement);
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
        const contactsElement = templates.contacts.content.firstElementChild?.cloneNode(true) as HTMLElement;
        if (!contactsElement) throw new Error('Contacts template is empty');

        contactsFormInstance = new ContactsForm(contactsElement, events);
        modal.render(contactsElement);
        modal.open('contacts' as ModalType);
    }
});

events.on('order:reset', () => {
    const formContainer = modal.getContainer();
    if (formContainer && contactsFormInstance) {
        contactsFormInstance.reset();
    }
});

// Убираем зацикливание при валидации формы контактов
let contactsFormInstance: ContactsForm | null = null;

events.on('contacts:emailChange', (event: { value: string }) => {
    appData.setOrderField('email', event.value);
    if (!contactsFormInstance) return;

    const errors = appData.validateContacts();
    contactsFormInstance.setErrors(errors);
    contactsFormInstance.setValid(appData.isContactsValid());
});

events.on('contacts:phoneChange', (event: { value: string }) => {
    appData.setOrderField('phone', event.value);
    if (!contactsFormInstance) return;

    const errors = appData.validateContacts();
    contactsFormInstance.setErrors(errors);
    contactsFormInstance.setValid(appData.isContactsValid());
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