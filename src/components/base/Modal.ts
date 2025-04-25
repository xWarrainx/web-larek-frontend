import { Component } from "./Component";
import { EventEmitter } from "./events";

// Форма модального окна
export class Modal extends Component<{ content: HTMLElement }> {
    private closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this.closeButton = this.container.querySelector('.modal__close');
        this.closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    open(content: HTMLElement): void {
        const contentContainer = this.container.querySelector('.modal__content');
        contentContainer.innerHTML = '';
        contentContainer.append(content);
        this.toggle(true);
        this.events.emit('modal:open');
    }

    close(): void {
        this.toggle(false);
        this.events.emit('modal:close');
    }

    private handleOutsideClick(e: MouseEvent): void {
        if (e.target === this.container) this.close();
    }

    private toggle(state: boolean): void {
        this.container.classList.toggle('modal_active', state);
    }
    
    private toggleBodyScroll(state: boolean): void {
        document.body.style.overflow = state ? 'hidden' : '';
    }
}