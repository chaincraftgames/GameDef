import * as yaml from 'js-yaml';

import { fetchData } from './fetcher.js';
import { GameDefinition } from "./game-definition";

export const preprocess = async (path: string): Promise<GameDefinition> => {
    let gameDefinition: GameDefinition = {};

    // Read the main file
    console.log("Reading main file", path);
    gameDefinition = await readAndMerge(path, gameDefinition);
    let includes = gameDefinition.includes || [];

    for (const include of includes) {
        console.log("Reading included file", include);
        gameDefinition = await readAndMerge(include, gameDefinition);
    }

    // console.log("In preprocess - gameDefinition after merging includes:", gameDefinition);
    return gameDefinition;
}

const readAndMerge = async (input: string, gameDefinition: GameDefinition = {}) => {
    try {
        let mergedObject = gameDefinition;
        // If the yaml file names starts with /examples its path is relative to the examples directory.  
        // The examples directory is a sibing of the project directory so we need to adjust the path.
        if (input.startsWith("/examples/")) {
            input = `..${input}`;
        }
        const fileContent = await fetchData(input, true );
        const yamlObject = yaml.load(fileContent) as GameDefinition;
    
        // Some of the keys in the yaml we are merging might be in the merged object already and would be overwritten
        // so we can't do a spread operator merge here.  Instead we need to merge the objects manually.
        for (const key of Object.keys(yamlObject) as string[]) {
            if (Array.isArray(mergedObject[key]) && Array.isArray(yamlObject[key])) {
                mergedObject[key] = [...mergedObject[key] as any[], ...yamlObject[key] as any[]];
            // Not currently suported in the GameDefinition type
            // } else if (mergedObject[key] && typeof mergedObject[key] === 'object' && typeof yamlObject[key] === 'object') {
            //     mergedObject[key] = { ...mergedObject[key], ...yamlObject[key] };
            } else {
                mergedObject[key] = yamlObject[key];
            }
        }
        return mergedObject;
    } catch (error) {
        console.error(`Error reading and merging file ${input}`, error);
        return gameDefinition;    
    }
}
