import { Form } from "./Form";
import { EventEmitter } from "./events";

interface IContactsData {
    email: string;
    phone: string;
}

export class ContactsForm extends Form<IContactsData> {
    constructor(container: HTMLElement, events: EventEmitter) {
        super(container, events);

        this.setHandler('form', 'submit', (e: Event) => {
            e.preventDefault();
            const email = (this.container.querySelector('[name="email"]') as HTMLInputElement).value;
            const phone = (this.container.querySelector('[name="phone"]') as HTMLInputElement).value;

            if (email && phone) {
                this.events.emit('contacts:submit', { email, phone });
            }
        });
    }
}