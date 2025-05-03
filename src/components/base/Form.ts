import { Component } from "./Component";
import { EventEmitter } from "./events";
import { ensureElement } from "../../utils/utils";

export abstract class Form<T> extends Component<T> {
    protected submitButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: EventEmitter, submitSelector: string = '[type="submit"]') {
        super(container, events);
        this.submitButton = ensureElement<HTMLButtonElement>(submitSelector, container);
    }

    setError(message: string): void {
        this.setText('.form__errors', message);
    }

    protected formatErrors(errors: Record<string, string | undefined>): string {
        return Object.values(errors).filter(Boolean).join('\n');
    }

    setValid(state: boolean): void {
        this.submitButton.disabled = !state;
        this.submitButton.classList.toggle('button-active', state);
    }
}