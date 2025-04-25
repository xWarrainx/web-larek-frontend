
export abstract class Component<T> {
    protected container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    // Общие методы для всех компонентов
    protected setText(selector: string, value: string): void {
        const element = this.container.querySelector(selector);
        if (element) element.textContent = value;
    }

    protected setClass(selector: string, className: string): void {
        const element = this.container.querySelector(selector);
        if (element) {
            if (className) {
                element.classList.add(className);
            } else {
                element.className = '';
            }
        }
    }

    protected setImage(selector: string, src: string, alt?: string): void {
        const element = this.container.querySelector(selector) as HTMLImageElement;
        if (element) {
            element.src = src;
            if (alt) element.alt = alt;
        }
    }

    protected setDisabled(selector: string, state: boolean): void {
        const element = this.container.querySelector(selector) as HTMLButtonElement;
        if (element) element.disabled = state;
    }
}