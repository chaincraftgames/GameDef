import {
  RulesetFunction,
  RulesetFunctionContext,
} from "@stoplight/spectral-core";
import { GameDefinition } from "../../game-definition";

let _componentsByTypeCache: { [type: string]: any[] | undefined } = {};
let _componentsByIdCache: { [id: string]: any | undefined } = {};
let _entitiesByTypeCache: { [type: string]: any[] | undefined } = {};

export function withGameDefinition(
  func: (target: any, options: any, gamedef: GameDefinition, context: RulesetFunctionContext) => any
): RulesetFunction {
  return function (target: any, options: any, context: RulesetFunctionContext) {
    const { document } = context;
    const gamedef = document.data as unknown as GameDefinition;

    // Clear the cache when the gamedef changes
    clearCaches();

    return func(target, options, gamedef, context);
  };
}

export function getComponentsByType(gamedef: GameDefinition, type: string) {
  // If the result is in the cache, return it
  if (_componentsByTypeCache[type]) {
    return _componentsByTypeCache[type];
  }

  // Otherwise, compute the result and store it in the cache
  const result = gamedef.components?.filter(
    (component) => (component as any).type === type
  );
  _componentsByTypeCache[type] = result;

  return result;
}

export function componentRefIsType(
  { $component_ref: componentId }: { $component_ref: string },
  type: string,
  gamedef: GameDefinition
) {
  return getComponentsByType(gamedef, type)?.some(
    (component) => component.id === componentId
  );
}

export function entityHasComponentOfType(gamedef: GameDefinition, entity: any, type: string) {
  if (!entity.$components?.length) {
    return false;
  }

  return entity.$components.some((componentRef: { $component_ref: string; }) =>
    componentRefIsType(componentRef, type, gamedef)
  );
}

export function getEntityComponentsOfType(gamedef: GameDefinition, entity: any, type: string) {
  return entity.$components?.filter((componentRef: { $component_ref: string; }) =>
    componentRefIsType(componentRef, type, gamedef)
  );
}

export function getComponentByRef(gamedef: GameDefinition, componentRef: { $component_ref: string; }) {
  const { $component_ref: id } = componentRef;
  return getComponentById(gamedef, id);
}

export function getComponentById(gamedef: GameDefinition, id: string) {
  if (_componentsByIdCache[id]) {
    return _componentsByIdCache[id];
  }
  const component = gamedef.components?.find((component) => component.id === id);
  _componentsByIdCache[id] = component;
  return component;
}

export function getEntitiesByType(gamedef: GameDefinition, type: string) {
  // If the result is in the cache, return it
  if (_entitiesByTypeCache[type]) {
    return _entitiesByTypeCache[type];
  }

  // Otherwise, compute the result and store it in the cache
  let result = gamedef[`${type}s`]
  // console.log("In getEntitiesByType - type, result:", type, result);
  if (result && !(result instanceof Array)) {
    result = [result];
  }
  _entitiesByTypeCache[type] = result;

  return result;  
}

function clearCaches() {
  _componentsByTypeCache = {};
  _componentsByIdCache = {};
  _entitiesByTypeCache = {};
}
