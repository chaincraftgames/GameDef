#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { preprocess } from './preprocessor.js';
const argv = yargs(hideBin(process.argv))
    .options({
    preprocessOnly: {
        alias: 'p',
        description: 'Only preprocess the YAML file',
        type: 'boolean'
    },
    path: {
        alias: 'f',
        description: 'Path to the YAML file',
        type: 'string',
    }
})
    .help()
    .alias('help', 'h')
    .argv;
// .argv;
const main = async () => {
    const gameDefinition = await preprocess(argv.path);
    if (!argv.preprocessOnly) {
        // Validate the game definition
        // const validator = new Validator();
        // validator.validate(gameDefinition);
    }
    console.log(gameDefinition);
};
main();
