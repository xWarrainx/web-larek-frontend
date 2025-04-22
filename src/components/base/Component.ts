
export abstract class Component<T> {
    protected container: HTMLElement;

    constructor(protected template: HTMLTemplateElement) {
        this.container = template.content.cloneNode(true) as HTMLElement;
    }

    protected setText(selector: string, value: string) {
        const element = this.container.querySelector(selector);
        if (element) element.textContent = value;
    }

    protected setImage(selector: string, src: string, alt?: string) {
        const element = this.container.querySelector(selector) as HTMLImageElement;
        if (element) {
            element.src = src;
            if (alt) element.alt = alt;
        }
    }

    protected setClass(selector: string, className: string) {
        const element = this.container.querySelector(selector);
        if (element) element.classList.add(className);
    }

    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}