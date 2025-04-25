// utils/validation.ts
export const validateForm = (form: HTMLFormElement): boolean => {
    let isValid = true;

    form.querySelectorAll('input').forEach(input => {
        if (!input.value.trim()) {
            markInvalid(input, true);
            isValid = false;
        } else {
            markInvalid(input, false);
        }
    });

    return isValid;
};

const markInvalid = (input: HTMLInputElement, state: boolean): void => {
    input.parentElement.classList.toggle('form__input_invalid', state);
};