import spectralCore from "@stoplight/spectral-core";
const { createRulesetFunction } = spectralCore;

import {
  withGameDefinition,
  getComponentsByType,
  getComponentById,
  getEntitiesByType,
} from "./util.js";

export default createRulesetFunction(
  {
    input: null,
    options: null,
  },
  withGameDefinition(function refExistsAndIsCorrectType(
    target,
    _options,
    gamedef,
    context
  ) {
    if (typeof target !== "string") {
      // Not a ref property.  Ignore it.
      return [];
    }

    // Target is the property value.  Get the property name from the path.
    const propertyName = context.path[context.path.length - 1];

    if (typeof propertyName !== "string") {
      // Not a ref property.  Ignore it.
      return [];
    }

    const matcher = /\$(.*?)_ref/;
    const match = (propertyName as string).match(matcher);
    if (!match) {
      // This is not a reference property. Ignore it.
      return [];
    }

    const refType = match[1];
    if (!refType) {
      // This is not a reference property. Ignore it.
      return [];
    }

    if (refType === 'property' || refType === 'r_property') {
      // This is a reference to a property.  We'll validate that in a separate rule.
      return [];
    }

    const message = `Invalid reference: ${target} is not a valid ${refType} id.`;
    // console.log("In refIsValid - target, refType:", target, refType);
    // return [];

    // return [{ message }]

    // Ref is a component reference.  Confirm existinece of component with the id
    if (refType === "component") {
      // console.log("In refIsValid - component by id:", getComponentById(gamedef, target));
      if (getComponentById(gamedef, target)) {
        return [];
      } else {
        // console.log("In refIsValid - returning message:", message);
        return [{ message }];
      }
    } 

    // Ref is to a specific component or entity type.  Confirm existince of component or entity type
    // with the id
    if (
      getComponentsByType(gamedef, refType)?.some(
        (component) => component.id === target
      )
    ) {
      return [];
    } else {
      const entities = getEntitiesByType(gamedef, refType);
      if (entities && entities.some((entity) => entity.id === target)) {
        return [];
      }
    }

    return [{ message }];
  })
);
