import { Component } from "./Component";
import { EventEmitter } from "./events";

export class Modal extends Component<void> {
    private contentContainer: HTMLElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);
        this.contentContainer = this.container.querySelector('.modal__content')!;

        this.setHandler('.modal__close', 'click', this.close.bind(this));
        this.setHandler('.modal', 'click', (e: Event) => {
            if (e.target === this.container) this.close();
        });

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') this.close();
        });

        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });
    }

    render(content: HTMLElement): void {
        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(content);
    }

    open(): void {
        this.container.classList.add('modal_active');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.events.emit('modal:close');
    }

    isOpened(): boolean {
        return this.container.classList.contains('modal_active');
    }
}