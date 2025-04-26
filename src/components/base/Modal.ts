import { EventEmitter } from "./events";

export class Modal {
    protected _container: HTMLElement;
    protected _content: HTMLElement;
    protected _closeButton: HTMLButtonElement;
    protected _events: EventEmitter;
    private _handleEscKey: (event: KeyboardEvent) => void;

    constructor(container: HTMLElement, events: EventEmitter) {
        this._container = container;
        this._events = events;
        this._content = this._container.querySelector('.modal__content');
        this._closeButton = this._container.querySelector('.modal__close');

        // Обработчик для клавиши Esc
        this._handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                this.close();
            }
        };

        this._closeButton.addEventListener('click', this.close.bind(this));
        this._container.addEventListener('click', (e) => {
            if (e.target === this._container) this.close();
        });
    }

    open(content?: HTMLElement) {
        if (content) {
            this._content.innerHTML = '';
            this._content.appendChild(content);
        }
        this._container.classList.add('modal_active');
        document.body.style.overflow = 'hidden';

        // Добавляем обработчик при открытии
        document.addEventListener('keydown', this._handleEscKey);
        this._events.emit('modal:open');
    }

    isOpened(): boolean {
        return this._container.classList.contains('modal_active');
    }
    
    close() {
        this._container.classList.remove('modal_active');
        document.body.style.overflow = '';

        // Удаляем обработчик при закрытии
        document.removeEventListener('keydown', this._handleEscKey);
        this._events.emit('modal:close');
    }
}