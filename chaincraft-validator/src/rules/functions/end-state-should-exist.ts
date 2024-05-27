import spectralCore from "@stoplight/spectral-core";
const { createRulesetFunction } = spectralCore;

import {
  withGameDefinition,
  entityHasComponentOfType,
 } from "./util.js";

export default createRulesetFunction(
  {
    input: null,
    options: null,
  },
  withGameDefinition(function hasEndState (target, _options, gamedef) {
    const states = target as any;
    const errorMessages = [{
      message: `At least one state should have an end_state component.  Otherwise, the game would never end.`,    
    }]
    if (!states?.length || !gamedef.components?.length) {
      return errorMessages;
    }

    const stateHasEndState = (
      state: any
    ) => entityHasComponentOfType(gamedef, state, "end_state");
    if (!states.some(stateHasEndState)) {
      return errorMessages;
    }

    return [];
  }
));