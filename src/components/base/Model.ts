import { EventEmitter } from "../../components/base/events";

/**
 * Гарда для проверки, является ли объект экземпляром Model
 */
export const isModel = (obj: unknown): obj is Model<any> => {
    return obj instanceof Model;
}

/**
 * Абстрактный базовый класс для всех моделей
 * @template T - тип данных модели
 */
export abstract class Model<T> {
    constructor(data: Partial<T>, protected events: EventEmitter) {
        Object.assign(this, data);
    }

    /**
     * Уведомляет подписчиков об изменениях в модели
     * @param event - название события
     * @param payload - данные для передачи (по умолчанию пустой объект)
     */
    emitChanges(event: string, payload?: object) {
        this.events.emit(event, payload ?? {});
    }
}