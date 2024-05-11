import * as yaml from 'js-yaml';

import { fetchData } from './fetcher.js';
import { GameDefinition } from "./game-definition";

export const preprocess = async (path: string): Promise<GameDefinition> => {
    let gameDefinition: GameDefinition = {};

    // Read the main file
    gameDefinition = await readAndMerge(path, gameDefinition);
    const includes = gameDefinition.includes || [];
    for (const include of includes) {
        gameDefinition = await readAndMerge(include, gameDefinition);
    }

    return gameDefinition;
}

const readAndMerge = async (input: string, gameDefinition: GameDefinition = {}) => {
    let mergedObject = gameDefinition;
    const fileContent = await fetchData(input);
    const yamlObject = yaml.load(fileContent) as GameDefinition;

    // Some of the keys in the yaml we are merging might be in the merged object already and would be overwritten
    // so we can't do a spread operator merge here.  Instead we need to merge the objects manually.
    for (const key of Object.keys(yamlObject) as string[]) {
        if (mergedObject[key] && typeof mergedObject[key] === 'object') {
            mergedObject[key] = { ...mergedObject[key], ...yamlObject[key] };
        } else {
            mergedObject[key] = yamlObject[key];
        }
    }
    return mergedObject;
}
