import * as yaml from 'js-yaml';
import { fetchData } from './fetcher.js';

type PropertyDef = {
    id: string;
    type: string | number | boolean | [string];
    default: any;
};

type ComponentsRegistryEntry = {
    schema: string;
    "runtime_properties": [PropertyDef];
};

type ComponentsRegistry = {
    [componentName: string]: ComponentsRegistryEntry;
};

const _componentsRegistryFile = "../registries/components.yaml";

let _componentsRegistry: Promise<ComponentsRegistry> | undefined;

export const componentSchema = async (componentName: string): Promise<string> => {
    
    return (await getComponentsRegistryEntry(componentName)).schema;
}

export const componentRuntimeProperties = async (componentName: string): Promise<[PropertyDef]> => {
    return (await getComponentsRegistryEntry(componentName))["runtime_properties"] ?? [];
}

const getComponentsRegistryEntry = async (componentName: string): Promise<ComponentsRegistryEntry> => {
    if (!_componentsRegistry) {
        _componentsRegistry = _loadComponentsRegistry();
    }
    const componentsRegistry = await _componentsRegistry;
    if (!componentsRegistry[componentName]) {
        throw new Error(`Component schema not found for ${componentName}`);
    }
    return componentsRegistry[componentName];
}

const _loadComponentsRegistry = async (): Promise<ComponentsRegistry> => {
    const componentsRegistry = await fetchData(_componentsRegistryFile, true);
    return yaml.load(componentsRegistry) as ComponentsRegistry;
}