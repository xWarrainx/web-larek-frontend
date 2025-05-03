import { Component } from "./Component";
import { EventEmitter } from "./events";
import { ensureElement } from "../../utils/utils";

interface IPageState {
    counter: number;
    locked: boolean;
}

export class Page extends Component<IPageState> {
    private readonly _counter: HTMLElement;
    private readonly _gallery: HTMLElement;
    private readonly _basketButton: HTMLButtonElement;

    constructor(
        container: HTMLElement,
        protected events: EventEmitter
    ) {
        super(container, events);

        this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._gallery = ensureElement<HTMLElement>('.gallery', container);
        this._basketButton = ensureElement<HTMLButtonElement>('.header__basket', container);

        this._basketButton.addEventListener('click', () => {
            events.emit('basket:open');
        });
    }

    set locked(value: boolean) {
        this.container.classList.toggle('page_locked', value);
    }

    set counter(value: number) {
        this._counter.textContent = String(value);
        this._counter.classList.add('header__basket-counter--updated');
        setTimeout(() => {
            this._counter.classList.remove('header__basket-counter--updated');
        }, 300);
    }

    set gallery(items: HTMLElement[]) {
        this._gallery.replaceChildren(...items);
    }

    setError(message: string): void {
        this._gallery.innerHTML = `<p class="error">${message}</p>`;
    }

    clearError(): void {
        // Автоматически очищается при установке gallery
    }
}