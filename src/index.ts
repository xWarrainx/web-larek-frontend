import './scss/styles.scss';
import { LarekApi } from './components/LarekApi';
import { Page } from './components/base/Page';
import { API_URL, CDN_URL } from "./utils/constants";
import { Modal } from './components/base/Modal';

const api = new LarekApi(CDN_URL, API_URL);
const modal = new Modal(); // Создаем один экземпляр модалки
const page = new Page(api, modal); // Передаем в Page
page.renderProducts();