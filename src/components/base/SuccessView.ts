import { Component } from "./Component";
import { EventEmitter } from "./events";

export class SuccessView extends Component<{ total: number }> {
    private template: HTMLTemplateElement;
    private contentContainer: HTMLElement;
    private descriptionSelector: string;
    private closeButtonSelector: string;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        const templateElement = document.getElementById('success');
        if (!templateElement || !(templateElement instanceof HTMLTemplateElement)) {
            throw new Error('Success template not found');
        }
        this.template = templateElement;

        this.contentContainer = this.container.querySelector('.modal__content');
        if (!this.contentContainer) {
            throw new Error('Modal content container not found');
        }

        this.descriptionSelector = '.order-success__description';
        this.closeButtonSelector = '.order-success__close';
    }

    render(data: { total: number }): HTMLElement {
        //Пробовал убрать все в конструктор, однко при оформлении первого заказа
        //модальное окно успешного заказа корректно отображается и закрывается,
        //при оформлении последующих не заполняется данными, так как я повторно использую
        //один и тот же клонированный DocumentFragment.
        const content = this.template.content.cloneNode(true) as DocumentFragment;

        const description = content.querySelector(this.descriptionSelector);
        if (description) {
            description.textContent = `Списано ${data.total} синапсов`;
        }

        const closeButton = content.querySelector(this.closeButtonSelector);
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.events.emit('success:close');
            });
        }

        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(content);

        return this.container;
    }
}