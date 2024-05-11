// import { preprocess } from './preprocessor';
// import { GameDefinition } from './game-definition';

export class Validator {
    // private gameDefinition: GameDefinition | null = null;
    // private errors: string[] = [];
    
    // constructor(private path: string) {}

    validateStructure() {
        // Validate the structure of the preprocessed game definitions
    }

    validateLogic() {
        // Validate the logic of the game definitions
    }

    reportErrors() {
        // Report any errors found during validation
    }

    async validate() {
        // this.gameDefinition = await preprocess(this.path);
        this.validateStructure();
        this.validateLogic();
        this.reportErrors();
    }
}