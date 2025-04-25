import {Component} from "../base/Component";
import {IEvents} from "../base/events";
import {ensureElement} from "../../utils/utils";

interface IFormState {
    valid: boolean;
    errors: string;
}

export class Form<T> extends Component<IFormState> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected events: IEvents) {
        // Создаем временный template для совместимости с Component
        const tempTemplate = document.createElement('template');
        tempTemplate.content.appendChild(container.cloneNode(true));

        super(tempTemplate); // Теперь передаем template

        this.container = container; // Сохраняем оригинальный form

        this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
        this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            const field = target.name as keyof T;
            const value = target.value;
            this.onInputChange(field, value);
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`${this.container.name}:submit`);
        });
    }

    protected onInputChange(field: keyof T, value: string) {
        this.events.emit(`${this.container.name}.${String(field)}:change`, {
            field,
            value
        });
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
    }

    set errors(value: string) {
        if (this._errors) {
            this._errors.textContent = value;
        }
    }

    render(state: Partial<T> & IFormState): HTMLElement {
        const {valid, errors, ...inputs} = state;

        if (valid !== undefined) {
            this.valid = valid;
        }

        if (errors !== undefined) {
            this.errors = errors;
        }

        Object.assign(this, inputs);
        return this.container;
    }
}