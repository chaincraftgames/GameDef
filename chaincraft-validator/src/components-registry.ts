import * as yaml from 'js-yaml';
import { fetchData } from './fetcher.js';

type PropertyDef = {
    id: string;
    type: string | number | boolean | [string];
    default: any;
};

type ComponentsRegistry = {
    [componentName: string]: {
        schema: string;
        "runtime_properties": [PropertyDef];
    };
};

const _componentsRegistryFile = "../registries/components.yaml";

let _componentsRegistry: ComponentsRegistry | undefined;

export const componentSchema = async (componentName: string): Promise<string> => {
    if (!_componentsRegistry) {
        _componentsRegistry = await _loadComponentsRegistry();
    }
    if (!_componentsRegistry[componentName]) {
        throw new Error(`Component schema not found for ${componentName}`);
    }
    return _componentsRegistry[componentName].schema;
}

export const componentRuntimeProperties = async (componentName: string): Promise<[PropertyDef]> => {
    if (!_componentsRegistry) {
        _componentsRegistry = await _loadComponentsRegistry();
    }
    if (!_componentsRegistry[componentName]) {
        throw new Error(`Component not found for ${componentName}`);
    }
    return _componentsRegistry[componentName]["runtime_properties"] ?? [];
}

const _loadComponentsRegistry = async (): Promise<ComponentsRegistry> => {
    const componentsRegistry = await fetchData(_componentsRegistryFile, true);
    return yaml.load(componentsRegistry) as ComponentsRegistry;
}