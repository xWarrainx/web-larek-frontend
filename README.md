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
Проект использует архитектурный паттерн MVP (Model-View-Presenter) с элементами событийно-ориентированного подхода.

-----Слой Модели (Model)-----
1. Класс AppData
Центральный класс для управления состоянием приложения:
    - _basket: IProduct[] - товары в корзине
    - _catalog: IProduct[] - каталог товаров
    - _order: IOrder - данные заказа
Методы:
    - addToBasket(product: IProduct) - добавление в корзину
    - removeFromBasket(id: string) - удаление из корзины
    - clearBasket() - очистка корзины
    - getOrderTotal() - расчёт суммы заказа

Типы данных:

interface Product {
    id: string;
    title: string;
    price: number | null;
    description: string;
    image: string;
    category: string;
}

interface Order {
    items: string[];
    payment: string;
    address: string;
    email: string;
    phone: string;
    total: number;
}

-----Слой Представления (View)-----
1. Card:
    - Рендерит карточку товара из шаблона card-catalog
    - Генерирует события:
    - card:select - при клике на карточку
2. CardPreview:
    - Детальный просмотр товара (шаблон card-preview)
3. Basket:
    - Рендерит корзину из шаблона basket
    Генерирует события:
        - basket:open - открытие корзины
        - basket:remove - удаление товара
4. OrderForm:
    - Управляет формами заказа (шаблоны order и contacts)
    - Генерирует события:
        - order:submit - отправка формы доставки
        - contacts:submit - отправка контактов
5. Modal:
    - Универсальное модальное окно
    - Методы open(), close()

-----Слой Презентера-----
Логика взаимодействия реализована в src/index.ts:
1. Инициализация компонентов:
    const events = new EventEmitter();
    const api = new LarekApi(CDN_URL, API_URL);
    const appData = new AppData(events);

2. Пример обработки событий:

events.on('basket:add', (product: IProduct) => {
    appData.addToBasket(product);
    modal.close();
});

events.on('basket:changed', (items: IProduct[]) => {
    basketCounter.textContent = items.length.toString();
});

---------------------------------------------------
Пример взаимодействия компонентов

Сценарий: Пользователь добавляет товар в корзину:
    - Card генерирует событие 'card:select'
    - Modal открывает CardPreview с кнопкой "В корзину"
    - При клике генерируется 'basket:add' с товаром
    - AppData обновляет корзину и генерирует 'basket:changed'
    - Обновляется счетчик в шапке (basketCounter)