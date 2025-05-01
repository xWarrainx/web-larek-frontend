import { EventEmitter } from "./events";

export class Form {
    public container: HTMLElement;
    protected submitButton: HTMLButtonElement;
    protected errorsContainer: HTMLElement;
    public onSubmit: (data: any) => void = () => {};

    constructor(container: HTMLElement, protected events: EventEmitter) {
        this.container = container;
        this.submitButton = this.container.querySelector('button[type="submit"]')!;
        this.errorsContainer = this.container.querySelector('.form__errors')!;

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validate()) {
                this.onSubmit(this.getFormData());
            }
        });

        this.container.addEventListener('input', () => {
            this.updateSubmitButton(this.validate());
        });
    }

    protected validate(): boolean {
        return true;
    }

    protected updateSubmitButton(valid: boolean): void {
        this.submitButton.disabled = !valid;
    }

    protected showErrors(message: string): void {
        this.errorsContainer.textContent = message;
    }

    public getFormData(): Record<string, string> {
        const formData: Record<string, string> = {};
        const inputs = this.container.querySelectorAll('input[name]');
        inputs.forEach((input: HTMLInputElement) => {
            formData[input.name] = input.value;
        });
        return formData;
    }
    
    public setError(message: string): void {
        this.showErrors(message);
    }
}