// ValidationManager.ts
import { Validator } from './validator.js';
import { ReferencesValidator } from './references-validator.js';
import { SchemaValidator } from './schema-validator.js';
import { preprocess } from './preprocessor.js';
import { GameDefinition } from './game-definition.js';
import type { ErrorObject } from 'ajv';

interface ValidationOptions {
    validateReferences: boolean;
}

export class ValidationManager {
    private validators: Validator[] = [];
    private _gameDefinition: GameDefinition | null = null;
    private _errors: ErrorObject[] = [];

    constructor(private path: string, private options: ValidationOptions = {
        validateReferences: true,
    }) {
    }

    get gameDefinition(): GameDefinition | null {
        return this._gameDefinition;
    }

    get errors(): ErrorObject[] {
        return this.validators.flatMap(validator => validator.errors);
    }

    async validate(): Promise<boolean> {
        try {
            await this._process();

            // Abort validation if the game definition could not be loaded
            if (!this._gameDefinition) {
                return false;
            }
            
            // Validating against the schema is required becasue the other 
            // validations assume the game definition is valid per the schema
            this.validators.push(new SchemaValidator(this._gameDefinition));

            if (this.options.validateReferences) {
                this.validators.push(new ReferencesValidator(this._gameDefinition));
            }

            const validatePromises = this.validators.map(validator => validator.validate());
            const results = await Promise.all(validatePromises);
            return results.every(promise => promise);
        } catch (error) {
            console.error("Error validating game definition: ", error);
            return false;
        }
    }

    async _process() {
        try {
            this._gameDefinition = await preprocess(this.path);
        } catch (e) {
            this._errors.push({
                message: `Error processing game definition: ${e}`,
                keyword: '',
                instancePath: '',
                schemaPath: '',
                params: {}
            });
        }
    }
}