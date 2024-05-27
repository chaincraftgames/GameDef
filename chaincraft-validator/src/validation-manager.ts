// ValidationManager.ts
import { Validator } from './validator.js';
import { ReferencesValidator } from './references-validator.js';
import { SchemaValidator } from './schema-validator.js';
import { RulesetValidator } from './ruleset-validator.js';
import { preprocess } from './preprocessor.js';
import { GameDefinition } from './game-definition.js';

interface ValidationOptions {
    validateReferences: boolean;
    validationRuleset: any;
}

export class ValidationManager {
    private validators: Validator[] = [];
    private _gameDefinition: GameDefinition | null = null;
    private _errors: any[] = [];

    constructor(private path: string, private options: ValidationOptions = {
        validateReferences: false,
        validationRuleset: {}
    }) {
    }

    get gameDefinition(): GameDefinition | null {
        return this._gameDefinition;
    }

    get errors(): any[] {
        return this.validators.flatMap(validator => {
            return validator.errors.map(error => {
                return {
                    validator: validator.constructor.name,
                    ...error
                };
            });
        });
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

            if (this.options.validationRuleset) {
                this.validators.push(new RulesetValidator(this._gameDefinition, this.options.validationRuleset));
            }

            const validatePromises = this.validators.map(this._validateUsingValidator.bind(this));
            const results = await Promise.all(validatePromises);
            return results.every(promise => promise);
        } catch (error) {
            this._errors.push({
                message: `Error validating game definition: ${error}`,
            });
            return false;
        }
    }

    async _process() {
        try {
            this._gameDefinition = await preprocess(this.path);
        } catch (e) {
            this._errors.push({
                message: `Error processing game definition: ${e}`,
            });
        }
    }

    async _validateUsingValidator(validator: Validator) {
        const validatorName = validator.constructor.name;
        console.log(`Validating gamedef using ${validatorName}`)
        try {
            await validator.validate();
            return validator.errors.length === 0;
        } catch (error) {
            this._errors.push({
                validator: validatorName,
                message: `Error validating game definition: ${error}`,
            });
            return false;
        }
        
    }
}