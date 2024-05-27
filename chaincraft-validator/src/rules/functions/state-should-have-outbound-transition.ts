import spectralCore from "@stoplight/spectral-core";
const { createRulesetFunction } = spectralCore;

import { withGameDefinition, entityHasComponentOfType } from "./util.js";

export default createRulesetFunction(
  {
    input: null,
    options: null,
  },
  withGameDefinition(function hasOutboundTransition(target, _options, gamedef) {
    const state = target as any;
    const errorMessages = [
      {
        message: `State ${state.id} has no outbound transitions and is not an end_state (does not have an end_state component).  Gameplay would have no way to exit the state once entered.`,
      },
    ];
    if (!state.$components?.length || !gamedef.components?.length) {
      return errorMessages;
    }

    const stateHasTransitionOrEndState = (
      state: any
    ) =>
      entityHasComponentOfType(gamedef, state, "transition") ||
      entityHasComponentOfType(gamedef, state, "end_state");
    if (!stateHasTransitionOrEndState(state)) {
      return errorMessages;
    }

    return [];
  })
);
