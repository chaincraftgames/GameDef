
import type { ErrorObject, ValidateFunction } from 'ajv';

import type { GameDefinition } from './game-definition.js';

import {  
    actionSchema, componentSchema, functionSchema, roleSchema, roundSchema, 
    flowSchema, gameSchema
} from './schemas.js'

import { Validator } from './validator.js';

export class SchemaValidator implements Validator {
    private _errors: ErrorObject[] = [];
    
    constructor(private _gameDefinition: GameDefinition) {
    }

    get errors(): ErrorObject[] {
        return this._errors;
    }

    async validate() {
        console.log('Validating game definition against schema...');
        // Clear any previous results
        this._errors = [];

        return await this._validateAgainstSchema();
    }
    
    async _validateAgainstSchema() {
        try {
            const areComponentsValid = await this._validateComponents();
            const areFunctionsValid = await this._validateFunctions();
            const areRolesValid = await this._validateRoles();
            const areRoundsValid = await this._validateRounds();
            const isFlowValid = await this._validateFlow();
            const areActionsValid = await this._validateActions();
            const isGameValid = await this._validateGame();
            return areComponentsValid && areFunctionsValid && areRolesValid && 
                   areRoundsValid && isFlowValid && areActionsValid && 
                   isGameValid;
        } catch (error) {
            this._errors.push({
                message: `Error validating game definition: ${error}`,
                keyword: '',
                instancePath: '',
                schemaPath: '',
                params: {}
            });
            return false;
        }
    }

    async _validateFunctions() {
        let allFunctionsValid = true;
        if (this._gameDefinition && Array.isArray(this._gameDefinition.functions)) {
            const functionSchemaValidator: ValidateFunction = await functionSchema();
            this._gameDefinition.functions.forEach((func, index) => {
                const functionIsValid = functionSchemaValidator(func);
                if (!functionIsValid && functionSchemaValidator.errors) {
                    this._pushErrors('functions', func, index, functionSchemaValidator.errors);
                }
                allFunctionsValid = allFunctionsValid && functionIsValid;
            });
        }
        return allFunctionsValid;
    }

    async _validateRoles() {
        if (this._gameDefinition && Array.isArray(this._gameDefinition.roles)) {
            const roleSchemaValidator: ValidateFunction = await roleSchema();
            const validations = this._gameDefinition.roles.map(async (role, index) => {
                let roleIsValid = roleSchemaValidator(role);
                if (!roleIsValid && roleSchemaValidator.errors) {
                    this._pushErrors('roles', role, index, roleSchemaValidator.errors);
                }
                return roleIsValid;
            });
    
            const results = await Promise.all(validations);
            return results.every(result => result);
        }
        return true;
    }

    async _validateRounds() {
        if (this._gameDefinition && Array.isArray(this._gameDefinition.rounds)) {
            const roundSchemaValidator: ValidateFunction = await roundSchema();
            const validations = this._gameDefinition.rounds.map(async (round, index) => {
                let roundIsValid = roundSchemaValidator(round);
                if (!roundIsValid && roundSchemaValidator.errors) {
                    this._pushErrors('rounds', round, index, roundSchemaValidator.errors);
                }
                return roundIsValid;
            });
    
            const results = await Promise.all(validations);
            return results.every(result => result);
        }
        return true;
    }

    async _validateFlow() {
        if (this._gameDefinition && this._gameDefinition.flow) {
            const flowSchemaValidator: ValidateFunction = await flowSchema();
            const flowIsValid = flowSchemaValidator(this._gameDefinition.flow);
            if (!flowIsValid && flowSchemaValidator.errors) {
                this._pushErrors('flow', this._gameDefinition.flow, 0, flowSchemaValidator.errors);
                return false;
            } 
        } else {
            const errorMessage = 'Error validating game definition: A single flow is required.';
            this._errors.push({
                message: errorMessage,
                keyword: '',
                instancePath: '',
                schemaPath: '',
                params: {}
            }); 
            return false;
        }
        return true;
    }

    async _validateActions() {
        if (this._gameDefinition && Array.isArray(this._gameDefinition.actions)) {
            const validations = this._gameDefinition.actions.map(async (action, index) => {
                const actionSchemaValidator: ValidateFunction = await actionSchema(action.action);
                const actionIsValid = actionSchemaValidator(action);
                if (!actionIsValid && actionSchemaValidator.errors) {
                    this._pushErrors('actions', action, index, actionSchemaValidator.errors);
                }
                return actionIsValid;
            });
    
            const results = await Promise.all(validations);
            return results.every(result => result);
        }
        return true;
    }

    async _validateComponents() {
        if (this._gameDefinition && Array.isArray(this._gameDefinition.components)) {
            const validations = this._gameDefinition.components.map(async (component: any, index: number) => {
                const componentSchemaValidator: ValidateFunction = await componentSchema(component.type);
                const componentIsValid = componentSchemaValidator(component);
                if (!componentIsValid && componentSchemaValidator.errors) {
                    this._pushErrors(component.type, component, index, componentSchemaValidator.errors);
                }
                return componentIsValid;
            });
    
            const results = await Promise.all(validations);
            return results.every(result => result);
        }
        return true;
    }

    async _validateGame() {
        if (this._gameDefinition && this._gameDefinition.game) {
            const gameSchemaValidator: ValidateFunction = await gameSchema();
            const gameIsValid = gameSchemaValidator(this._gameDefinition.game);
            if (!gameIsValid && gameSchemaValidator.errors) {
                this._pushErrors('game', this._gameDefinition.game, 0, gameSchemaValidator.errors);
                return false;
            } 
        } else {
            const errorMessage = 'Error validating game definition: A single game is required.';
            this._errors.push({
                message: errorMessage,
                keyword: '',
                instancePath: '',
                schemaPath: '',
                params: {}
            }); 
            return false;
        }
        return true;
    }

    _pushErrors(instanceType: string, instance: any, instanceIndex: number, errors: ErrorObject[]) {
        errors?.forEach((error) => {
            (error as any).instanceType = instanceType; // Add the instanceType property
            (error as any).instanceIndex = instanceIndex; // Add the instance index property
            (error as any).instanceId = instance.id || undefined; // Add the instance id property if defined
            this._errors.push(error);
        });
    }
}