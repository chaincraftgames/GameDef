import * as yaml from 'js-yaml';
import { fetchData } from './fetcher.js';

type ActionsRegistry = {
    [actionName: string]: {
        schema: string;
    };
};

const _actionsRegistryFile = "../registries/actions.yaml";

let _actionsRegistry: ActionsRegistry | undefined;

export const actionSchema = async (actionName: string): Promise<string> => {
    if (!_actionsRegistry) {
        _actionsRegistry = await _loadActionsRegistry();
    }
    if (!_actionsRegistry[actionName]) {
        throw new Error(`Action schema not found for ${actionName}`);
    }
    return _actionsRegistry[actionName].schema;
}

const _loadActionsRegistry = async (): Promise<ActionsRegistry> => {
    const actionsRegistry = await fetchData(_actionsRegistryFile, true);
    return yaml.load(actionsRegistry) as ActionsRegistry;
}