import { EventEmitter } from "./events";

export abstract class Component<T> {
    protected container: HTMLElement;
    protected events: EventEmitter;

    constructor(container: HTMLElement, events: EventEmitter) {
        this.container = container;
        this.events = events;
    }

    // Общие методы
    setText(selector: string, value: string): void {
        const element = this.container.querySelector(selector);
        if (element) element.textContent = value;
    }

    setDisabled(selector: string, state: boolean): void {
        const element = this.container.querySelector(selector) as HTMLButtonElement;
        if (element) element.disabled = state;
    }

    setImage(selector: string, src: string, alt?: string): void {
        const element = this.container.querySelector(selector) as HTMLImageElement;
        if (element) {
            element.src = src;
            if (alt) element.alt = alt;
        }
    }

    setClass(selector: string, className: string): void {
        const element = this.container.querySelector(selector);
        if (element) {
            element.className = className;
        }
    }

    public getContainer(): HTMLElement {
        return this.container;
    }

    protected setHandler(
        selector: string,
        event: string,
        handler: (event: Event) => void
    ) {
        const element = this.container.querySelector(selector);
        if (element) {
            element.removeEventListener(event, handler);
            element.addEventListener(event, handler);
        }
    }
}