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

// Инициализация модального окна
const modal = new Modal('modal-container', events);

// Получаем DOM элементы
const galleryElement = document.querySelector('.gallery');
const basketCounter = document.querySelector('.header__basket-counter');
const basketButton = document.querySelector('.header__basket');

if (!galleryElement || !basketCounter || !basketButton) {
    throw new Error('Required DOM elements not found');
}

// Инициализация компонентов
const preview = new CardPreview(cardPreviewTemplate, events, appData);
const cardComponent = new Card(cardTemplate, events);
const basketComponent = new Basket(basketTemplate, events);
const contactsForm = new ContactsForm(createFromTemplate(contactsTemplate), events);

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
});

events.on('basket:add', (product: IProduct) => {
    appData.addToBasket(product);
    events.emit('basket:changed', appData.basket);
});

events.on('basket:remove', (data: { id: string }) => {
    appData.removeFromBasket(data.id);
    events.emit('basket:changed', appData.basket);
});

events.on('basket:open', () => {
    // Функция для рендеринга корзины
    const renderBasket = () => {
        const basketElement = basketComponent.render({
            items: appData.basket,
            total: appData.getOrderTotal()
        });
        modal.render(basketElement);
    };

    // Первоначальный рендер
    renderBasket();

    // Создаем обработчик
    const basketChangeHandler = () => {
        renderBasket();
    };

    // Подписываемся на изменения
    events.on('basket:changed', basketChangeHandler);

    // Отписываемся при закрытии
    const originalClose = modal.close.bind(modal);
    modal.close = () => {
        events.off('basket:changed', basketChangeHandler);
        originalClose();
    };

    modal.open();
});

events.on('basket:changed', updateBasketUI);

events.on('order:open', () => {
    const orderElement = createFromTemplate(orderTemplate);
    const orderForm = new OrderForm(orderElement, events);

    // Обработка отправки формы заказа
    orderForm.onSubmit = (data) => {
        events.emit('order:submit', data);
    };

    modal.render(orderForm.container);
    modal.open(orderForm.container);
});

events.on('order:submit', (data: { payment: string, address: string }) => {
    appData.order.payment = data.payment;
    appData.order.address = data.address;
    events.emit('contacts:open');
});

events.on('contacts:open', () => {
    const contactsElement = createFromTemplate(contactsTemplate);
    const contactsForm = new ContactsForm(contactsElement, events);
    modal.render(contactsForm.container);
    modal.open(contactsForm.container);
});

events.on('contacts:submit', (data: { email: string; phone: string }) => {
    // Валидация данных
    if (!data.email || !data.phone || !appData.order.address || !appData.order.payment) {
        contactsForm.setError('Заполните все поля');
        return;
    }

    if (!data.email.includes('@')) {
        contactsForm.setError('Введите корректный email');
        return;
    }

    if (appData.basket.length === 0) {
        contactsForm.setError('Корзина пуста');
        return;
    }

    // Подготовка данных
    appData.order.email = data.email;
    appData.order.phone = data.phone;
    appData.order.total = appData.getOrderTotal();
    appData.order.items = appData.basket.map(item => item.id);

    api.orderProducts(appData.order)
        .then(() => {
            // Создаем элемент из шаблона success
            const successElement = successTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement;

            // Устанавливаем сумму
            const description = successElement.querySelector('.order-success__description');
            if (description) {
                description.textContent = `Списано ${appData.order.total} синапсов`;
            }

            // Настраиваем кнопку закрытия
            const closeButton = successElement.querySelector('.order-success__close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    modal.close();
                    appData.clearBasket();
                    updateBasketUI([]); // Обновляем счетчик корзины
                });
            }

            // Закрываем текущее модальное окно и открываем success
            modal.close();
            modal.render(successElement);
            modal.open();
        })
        .catch((error) => {
            console.error('Ошибка:', error);
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