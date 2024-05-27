import spectralCore from "@stoplight/spectral-core";
const { createRulesetFunction } = spectralCore;

import {
  withGameDefinition,
  getEntityComponentsOfType,
  getComponentByRef
} from "./util.js";

export default createRulesetFunction(
  {
    input: null,
    options: null,
  },
  withGameDefinition(function hasTriggerForEachTransition(target, _options, gamedef) {
    const state = target as any;

    const stateTransitionComponentRefs = getEntityComponentsOfType(gamedef, state, "transition");
    const stateTriggerComponentRefs = getEntityComponentsOfType(gamedef, state, "transition_trigger");
    
    const transitionsWithoutTriggers = stateTransitionComponentRefs.filter((transitionComponentRef: any) => {
      const { $component_ref: transitionComponentId } = transitionComponentRef;
      return !stateTriggerComponentRefs.some((componentRef: any) => {
        const triggerComponent = getComponentByRef(gamedef, componentRef);
        return triggerComponent?.properties?.$transition?.$transition_ref === transitionComponentId;
      });
    });

    const errorMessages = transitionsWithoutTriggers.map((transition: any) => ({
      message: `No trigger found for transition ${transition.$component_ref} on state ${target.id}.  There is no way to trigger this transition.`,
    }));

    return errorMessages;
  }
));