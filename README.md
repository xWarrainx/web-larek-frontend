# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
------------------------------------------------------
Архитектура проекта:

-----Слой Модели (Model)-----
1. Класс AppData
    Центральное хранилище состояния приложения и бизнес-логики:
    constructor(events: EventEmitter) Принимает:
        - events - экземпляр EventEmitter для взаимодействия между компонентами
    Поля:
        - _basket: IProduct[] - Товары, добавленные в корзину
        - _catalog: IProduct[] - Массив всех загруженных товаров
        - _order: IOrderForm - Данные текущего заказа (адрес, email и др.)
    Методы:
        - addToBasket(product: IProduct), возвращает void - Добавляет товар в корзину, если его там нет
        - removeFromBasket(id: string), возвращает void - Удаляет товар из корзины по ID
        - validateOrder(), возвращает FormErrors - Проверяет заполнение адреса и способа оплаты
        - validateContacts(), возвращает FormErrors - Валидация email и телефона
        - getOrderPayload(), возвращает IOrder - Формирует данные для отправки на сервер


Типы данных:

interface IProduct {
    id: string;
    title: string;
    price: number | null;
    description: string;
    image: string;
    category: string;
}

interface IOrder {
    items: string[];
    payment: string;
    address: string;
    email: string;
    phone: string;
    total: number;
}

type FormErrors = Partial<Record<keyof IOrderForm, string>>;

-----Слой Представления (View)-----
1. Класс Card
    Отображение карточки товара в каталоге.
    constructor(template: HTMLTemplateElement, events: EventEmitter)
    Поля:
        - template - шаблон card-catalog
        - element - DOM-элемент карточки
    Метод:
        - render(item: IProduct) - Создает DOM-элемент на основе данных товара
2. Класс CardPreview:
    Детальное отображение товара в модальном окне.
    constructor(template: HTMLTemplateElement, events: EventEmitter, appData: AppData)
    Поля:
        - _button - кнопка "В корзину/Удалить из корзины"
        - _currentItem - текущий отображаемый товар
    Метод:
        - updateButtonState() - Обновляет текст кнопки в зависимости от наличия в корзине
3. Класс Basket:
    Отображение корзины с товарами.
    constructor(container: HTMLElement, events: EventEmitter)
    Поля:
        - _list - контейнер списка товаров
        - _total - элемент с общей суммой
    Сеттеры:
        - items, тип данных - HTMLElement[] - Устанавливает элементы корзины
        - total, тип данных, number - Устанавливает общую сумму
4. Класс Modal:
    Управление модальными окнами.
    constructor(container: HTMLElement, events: EventEmitter)
    Метод:
        - open(type: ModalType) - Открывает модальное окно указанного типа
        - close() - Закрывает текущее модальное окно
        - render(content: HTMLElement) - Вставляет контент в модальное окно

-----Слой Презентера-----
Логика взаимодействия реализована в src/index.ts:
1. Инициализация компонентов:
    const events = new EventEmitter();
    const api = new LarekApi(CDN_URL, API_URL);
    const appData = new AppData(events);
    const page = new Page(document.body, events);

2. Ключевые событий:

    - Добавление в корзину
    events.on('basket:add', (product) => {
        appData.addToBasket(product);
        page.counter = appData.basket.length;
    });

    - Валидация формы
    events.on('contacts:emailChange', ({value}) => {
        appData.setOrderField('email', value);
        updateFormValidation();
    });

---------------------------------------------------
Пример взаимодействия компонентов

Сценарий: Последовательность оформления заказа:
    - Пользователь добавляет товары через CardPreview
    - При открытии корзины (Basket) рендерятся все добавленные товары
    - Форма заказа (OrderForm) валидирует данные доставки
    - Форма контактов (ContactsForm) проверяет email и телефон
    - После успешного оформления показывается SuccessView

----------------------------------------------------
Паттерны проектирования

MVP (Model-View-Presenter):
    - Модель: AppData
    - Представление: Card, Basket, Modal
    - Презентер: index.ts

Event Bus:
    - Централизованная обработка событий через EventEmitter

Template Method:
    - Базовый класс Component с общими методами рендеринга