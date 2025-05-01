import { Component } from "./Component";
import { EventEmitter } from "./events";

export abstract class Form<T> extends Component<T> {
    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);
    }

    setError(message: string): void {
        this.setText('.form__errors', message);
    }
}