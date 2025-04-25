import { Component } from "./Component";
import { EventEmitter } from "./events";
import { AppData } from "./AppData";

export class Page extends Component<{ counter: number }> {
    private counterElement: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter, private appData: AppData) {
        super(container);

        this.counterElement = this.container.querySelector('.header__basket-counter');
        events.on('basket:changed', () => {
            this.counterElement.textContent = String(this.appData.order.items.length);
        });
    }

    set locked(value: boolean) {
        this.container.classList.toggle('page_locked', value);
    }
}