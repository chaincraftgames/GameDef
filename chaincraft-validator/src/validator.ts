export interface Validator {
    validate(): void;
    errors: any[];
}