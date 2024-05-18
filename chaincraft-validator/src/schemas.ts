import Ajv, { ValidateFunction } from "ajv";
import { fetchData } from "./fetcher.js";

import { actionSchema as actionSchemaLocation } from "./actions-registry.js";
import { componentSchema as componentSchemaLocation } from "./components-registry.js";

// Core schema files
const coreSchemaFiles = {
    "function": "../schemas/function_schema.json",
    "game": "../schemas/game_schema.json",
    "role": "../schemas/role_schema.json",
    "round": "../schemas/round_schema.json",
    "flow": "../schemas/flow_schema.json",
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

let _functionSchema: ValidateFunction | undefined;
let _gameSchema: ValidateFunction | undefined;
let _roleSchema: ValidateFunction | undefined;
let _roundSchema: ValidateFunction | undefined;
let _flowSchema: ValidateFunction | undefined;

let _actionSchemas: { [actionName: string]: ValidateFunction } = {};
let _componentSchemas: { [componentName: string]: ValidateFunction } = {};

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
        _functionSchema = await _loadSchema(coreSchemaFiles.function);
    }
    return _functionSchema;
}

export const gameSchema = async (): Promise<ValidateFunction> => {
    if (!_gameSchema) {
        _gameSchema = await _loadSchema(coreSchemaFiles.game);
    }
    return _gameSchema;
}

export const roleSchema = async (): Promise<ValidateFunction> => {
    if (!_roleSchema) {
        _roleSchema = await _loadSchema(coreSchemaFiles.role);
    }
    return _roleSchema;
}

export const roundSchema = async (): Promise<ValidateFunction> => {
    if (!_roundSchema) {
        _roundSchema = await _loadSchema(coreSchemaFiles.round);
    }
    return _roundSchema;
}

export const flowSchema = async (): Promise<ValidateFunction> => {
    if (!_flowSchema) {
        _flowSchema = await _loadSchema(coreSchemaFiles.flow);
    }
    return _flowSchema;
}

export const actionSchema = async (actionName: string): Promise<ValidateFunction> => {
    if (!_actionSchemas[actionName]) {
        const schema = await actionSchemaLocation(actionName).then(_loadSchema);
        _actionSchemas[actionName] = schema;
    }
    return _actionSchemas[actionName];
}

export const componentSchema = async (componentName: string): Promise<ValidateFunction> => {
    if (!_componentSchemas[componentName]) {
        const schema = await componentSchemaLocation(componentName).then(_loadSchema);
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


