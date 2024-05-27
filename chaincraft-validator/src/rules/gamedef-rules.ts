import { RulesetDefinition } from '@stoplight/spectral-core';
import stateShouldHaveOutboundTransition from './functions/state-should-have-outbound-transition.js';
import endStateShouldExist from './functions/end-state-should-exist.js';
import everyTransitionShouldHaveTrigger from './functions/every_transition_should_have_trigger.js';
import refShouldExistAndBeCorrectType from './functions/ref-should-exist-and-be-correct-type.js';

const ruleset: RulesetDefinition = {
    rules: {
        "every reference should be valid": {
            description: "Ensure that every reference is valid.",
            message: "{{error}}",
            given: "$..*",
            then: {
                function: refShouldExistAndBeCorrectType,
            },
            severity: "error",
        },
        "state_should_have_outbound_transition": {
            description: "Ensure each state has at least one outbound transition or an end_state.",
            message: "{{error}}",
            given: "$.states[*]",
            then: {
                function: stateShouldHaveOutboundTransition
            },
            severity: "warn",
        }, 
        "end_state_should_exist": {
            description: "Ensure at least one state has an end_state component.",
            message: "{{error}}",
            given: "$.states",
            then: {
                function: endStateShouldExist
            },
            severity: "warn",
        },
        "every_transition_should_have_trigger": {
            description: "Ensure each transition has a trigger.",
            message: "{{error}}",
            given: "$.states[*]",
            then: {
                function: everyTransitionShouldHaveTrigger
            },
            severity: "warn",
        },
    }
}

export default ruleset;