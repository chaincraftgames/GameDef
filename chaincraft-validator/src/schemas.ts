import Ajv, { ValidateFunction } from "ajv";
import { fetchData } from "./fetcher.js";

import { actionSchema as actionSchemaLocation } from "./actions-registry.js";
import { componentSchema as componentSchemaLocation } from "./components-registry.js";

// Core schema files
const coreSchemaFiles = {
    "function": "../schemas/function_schema.json",
    "game": "../schemas/game_schema.json",
    "role": "../schemas/role_schema.json",
    "state": "../schemas/state_schema.json",
    "deck": "../schemas/deck_schema.json",
    "board": "../schemas/board_schema.json",
};

const referencesSchemaId = "/schemas/references_schema.json";

const ajv = new Ajv({
    loadSchema: async (uri) => {
        // Schemas reference each other using /schemas.  The schemas directory
        // is a sibing of the project directory so we need to adjust the path.
        if (uri.startsWith("/schemas/")) {
            uri = `..${uri}`;
        }
        const schema = await fetchData(uri, true);
        return JSON.parse(schema);
    },
    verbose: true,
});

let _functionSchema: Promise<ValidateFunction> | undefined;
let _gameSchema: Promise<ValidateFunction> | undefined;
let _roleSchema: Promise<ValidateFunction> | undefined;
let _stateSchema: Promise<ValidateFunction> | undefined;
let _deckSchema: Promise<ValidateFunction> | undefined;
let _boardSchema: Promise<ValidateFunction> | undefined;

let _actionSchemas: { [actionName: string]: Promise<ValidateFunction> } = {};
let _componentSchemas: { [componentName: string]: Promise<ValidateFunction> } = {};

const _loadSchema = async (path: string): Promise<ValidateFunction> => {
    let schema;
    try {
        if (path.startsWith("/schemas/")) {
            path = `..${path}`;
        }
        schema = await fetchData(path, true);
        const validator = await ajv.compileAsync(JSON.parse(schema));
        return validator
    } catch (error) {
        console.error(`Error loading schema from ${path}.  Returned schema, error = `, schema, error);
        throw error;    
    }
}

export const functionSchema = async (): Promise<ValidateFunction> => {
    if (!_functionSchema) {
        _functionSchema = _loadSchema(coreSchemaFiles.function);
    }
    return _functionSchema;
}

export const gameSchema = async (): Promise<ValidateFunction> => {
    if (!_gameSchema) {
        _gameSchema = _loadSchema(coreSchemaFiles.game);
    }
    return _gameSchema;
}

export const roleSchema = async (): Promise<ValidateFunction> => {
    if (!_roleSchema) {
        _roleSchema = _loadSchema(coreSchemaFiles.role);
    }
    return _roleSchema;
}

export const stateSchema = async (): Promise<ValidateFunction> => {
    if (!_stateSchema) {
        _stateSchema = _loadSchema(coreSchemaFiles.state);
    }
    return _stateSchema;
}

export const deckSchema = async (): Promise<ValidateFunction> => {
    if (!_deckSchema) {
        _deckSchema = _loadSchema(coreSchemaFiles.deck);
    }
    return _deckSchema;
}

export const boardSchema = async (): Promise<ValidateFunction> => {
    if (!_boardSchema) {
        _boardSchema = _loadSchema(coreSchemaFiles.board);
    }
    return _boardSchema;
}

export const actionSchema = async (actionName: string): Promise<ValidateFunction> => {
    if (!_actionSchemas[actionName]) {
        const schema = actionSchemaLocation(actionName).then(_loadSchema);
        _actionSchemas[actionName] = schema;
    }
    return _actionSchemas[actionName];
}

export const componentSchema = async (componentName: string): Promise<ValidateFunction> => {
    if (!_componentSchemas[componentName]) {
        const schema = componentSchemaLocation(componentName).then(_loadSchema);
        _componentSchemas[componentName] = schema;
    }
    return _componentSchemas[componentName];
}

export const referencesSchema = async (): Promise<ValidateFunction> => {
    let validate = ajv.getSchema(referencesSchemaId);
    if (!validate) {
        validate = await _loadSchema(`..${referencesSchemaId}`);
    }
    return validate;
}


