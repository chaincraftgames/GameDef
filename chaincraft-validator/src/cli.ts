#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { preprocess } from './preprocessor.js';
import { ValidationManager } from './validation-manager.js';

interface Arguments {
    preprocessOnly: boolean;
    path: string;
    useRuleset: boolean;
}

const argv = yargs(hideBin(process.argv))
    .options({
        preprocessOnly: {
            alias: 'p',
            description: 'Only preprocess the YAML file',
            type: 'boolean',
            default: false
        },
        path: {
            alias: 'f',
            description: 'Path to the YAML file',
            type: 'string',
        },
        useRuleset: {
            alias: 'r',
            description: 'Use a ruleset validation',
            type: 'boolean',
            default: true
        }
    })
    .help()
    .alias('help', 'h')
    .argv as Arguments;
    // .argv;

const main = async () => {
    let gameDefinition;
    let isValid = true;
    let validator;
    if (argv.preprocessOnly) {
        try {
            gameDefinition = await preprocess(argv.path);
        }
        catch (e) {
            console.error(`Error processing game definition: ${e}`);
            process.exit(1);
        } 
    } else if (argv.useRuleset) {
        // Validate the game definition using Spectral
        const rules = (await import('./rules/gamedef-rules.js')).default;
        validator = new ValidationManager(argv.path, { 
            validateReferences: false,
            validationRuleset: rules
        });
    } else {
        // Validate the game definition
        validator = new ValidationManager(argv.path);
    }

    isValid = await validator?.validate() ?? false;
    gameDefinition = validator?.gameDefinition;
    if (!isValid) {
        if (validator?.errors.length === 0) {
            console.error('Unknown validation error');
            process.exit(1);
        } else {
            console.error('Validation errors:');
            console.error(validator?.errors);
            process.exit(1);
        }
    } else {
        console.log("Game defintion validated successfully -", gameDefinition);
    }
};

main();