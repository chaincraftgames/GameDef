import type { ErrorObject } from 'ajv';
export interface Validator {
    validate(): void;
    errors: ErrorObject[];
}