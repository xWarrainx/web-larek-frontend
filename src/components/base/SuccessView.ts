import { Component } from "./Component";
import { EventEmitter } from "./events";

export class SuccessView extends Component<{ total: number }> {
    private template: HTMLTemplateElement;

    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        // Получаем шаблон с явной проверкой типа
        const templateElement = document.getElementById('success');
        if (!templateElement || !(templateElement instanceof HTMLTemplateElement)) {
            throw new Error('Success template not found or wrong type');
        }
        this.template = templateElement;
    }

    render(data: { total: number }): HTMLElement {
        // Клонируем содержимое шаблона
        const content = this.template.content.cloneNode(true) as DocumentFragment;
        const description = content.querySelector('.order-success__description');

        if (description) {
            description.textContent = `Списано ${data.total} синапсов`;
        }

        // Находим контейнер для контента
        const contentContainer = this.container.querySelector('.modal__content');
        if (!contentContainer) {
            throw new Error('Modal content container not found');
        }

        // Очищаем и заполняем контейнер
        contentContainer.innerHTML = '';
        contentContainer.appendChild(content);

        // Находим и настраиваем кнопку закрытия
        const closeButton = contentContainer.querySelector('.order-success__close');
        if (!closeButton) {
            throw new Error('Close button not found');
        }

        closeButton.addEventListener('click', () => {
            this.events.emit('success:close');
        });

        return this.container;
    }
}