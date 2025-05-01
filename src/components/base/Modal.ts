import { EventEmitter } from "./events";

export class Modal {
    private container: HTMLElement;
    private content: HTMLElement;
    private closeButton: HTMLElement;
    private closeOnEsc: (e: KeyboardEvent) => void;

    constructor(containerId: string, protected events: EventEmitter) {
        this.container = document.getElementById(containerId)!;
        this.content = this.container.querySelector('.modal__content')!;
        this.closeButton = this.container.querySelector('.modal__close')!;

        this.closeOnEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };

        this.closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });
    }

    render(content: HTMLElement) {
        const contentContainer = this.container.querySelector('.modal__content');
        if (contentContainer) {
            contentContainer.innerHTML = '';
            contentContainer.appendChild(content);
        }
    }

    open(content?: HTMLElement) {
        this.container.classList.add('modal_active');
        document.addEventListener('keydown', this.closeOnEsc);
    }

    close() {
        this.container.classList.remove('modal_active');
        document.removeEventListener('keydown', this.closeOnEsc);
        this.events.emit('modal:close');
    }

    isOpened(): boolean {
        return this.container.classList.contains('modal_active');
    }
}