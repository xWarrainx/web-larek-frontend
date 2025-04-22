import './scss/styles.scss';
import { LarekApi } from './components/LarekApi';
import { Page } from './components/base/Page';
import { API_URL, CDN_URL } from "./utils/constants";

import { EventEmitter } from './components/base/events';




const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

const page = new Page(api, events);
page.renderProducts();
// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны


// Модель данных приложения


// Глобальные контейнеры


// Переиспользуемые части интерфейса


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно


// Получаем лоты с сервера
api.getProductList()
    .then(result => {
        // вместо лога поместите данные в модель
        console.log(result);
    })
    .catch(err => {
        console.error(err);
    });