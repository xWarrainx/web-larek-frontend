export class Modal {
    private modalElement: HTMLElement;
    private contentElement: HTMLElement;
    private closeButton: HTMLElement;

    constructor(modalId: string = 'modal-container') {
        this.modalElement = document.getElementById(modalId)!;
        this.contentElement = this.modalElement.querySelector('.modal__content')!;
        this.closeButton = this.modalElement.querySelector('.modal__close')!;

        this.closeButton.addEventListener('click', () => this.close());
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) this.close();
        });
    }

    open(content?: HTMLElement | string): void {
        if (content) {
            this.setContent(content);
        }
        this.modalElement.classList.add('modal_active');
        document.body.style.overflow = 'hidden';
    }

    close(): void {
        this.modalElement.classList.remove('modal_active');
        document.body.style.overflow = '';
    }

    setContent(content: HTMLElement | string): void {
        this.contentElement.innerHTML = '';

        if (typeof content === 'string') {
            this.contentElement.innerHTML = content;
        } else {
            this.contentElement.appendChild(content);
        }
    }

    isOpen(): boolean {
        return this.modalElement.classList.contains('modal_active');
    }
}