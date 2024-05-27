import spectralCore from "@stoplight/spectral-core";
const { Spectral, Document } = spectralCore;
import { IRuleResult, Ruleset, RulesetDefinition } from "@stoplight/spectral-core";
import Parsers from "@stoplight/spectral-parsers"; // make sure to install the package if you intend to use default parsers!

import { GameDefinition } from "./game-definition";
import { Validator } from "./validator";

export class RulesetValidator implements Validator {
  private _errors: IRuleResult[] = [];
  private _spectral = new Spectral();
  private _document;

  constructor(private _gameDefinition: GameDefinition, _ruleset: RulesetDefinition | Ruleset) {
    this._spectral = new Spectral();
    this._spectral.setRuleset(_ruleset); 
    this._document = new Document<unknown, Parsers.JsonParserResult<unknown>>(JSON.stringify(_gameDefinition), Parsers.Json);
  }

  get gameDefinition(): GameDefinition {
    return this._gameDefinition;
  }

  get errors(): IRuleResult[] {
    return this._errors;
  }

  async validate() {
    console.log('Validating game definition using ruleset...');
    // Clear any previous results
    this._errors = [];

    return await this._validateAgainstRuleset();
  }

  async _validateAgainstRuleset() {
    this._errors = [...await this._spectral.run(this._document)];
    return this._errors.length === 0;
  }
}