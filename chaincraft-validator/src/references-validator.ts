import { AnySchema, ErrorObject } from 'ajv';

import { referencesSchema } from './schemas.js';
import { componentRuntimeProperties } from './components-registry.js';

import { Validator } from './validator.js';
import { GameDefinition } from './game-definition.js';

export class ReferencesValidator implements Validator {
    private _errors: ErrorObject<string, Record<string, any>, unknown>[] = [];
    private _referencesSchema: AnySchema = {};

    private _idMaps: { [type: string]: { [id: string]: any } } = {};
 
    constructor(private _gameDefinition: GameDefinition) {
    }

    get errors(): ErrorObject<string, Record<string, any>, unknown>[] {
        return this._errors;
    }

    async validate() {
        console.log('Validating references...');
        this._referencesSchema = (await referencesSchema()).schema;

        this._buildIdMaps();
        return this._validateReferences(this._gameDefinition);
    }

    private _buildIdMaps(): void {
        this._idMaps = {};
        for (const def in (this._referencesSchema as any).definitions) {
            // property_ref is a special case, ignore it
            if (def === 'property_ref') {
                continue;
            }
            const type = def.slice(0, -4);
            this._idMaps[type] = {};
            
            // Build id maps for all top level objects of the given type
            const typePlural = `${type}s`;
            if (this._gameDefinition[typePlural] && Array.isArray(this._gameDefinition[typePlural])) {
                for (const obj of this._gameDefinition![typePlural] as any[]) {
                    if (obj.id) {
                        this._idMaps[type][obj.id] = obj;
                    }
                }
            } else if (this._gameDefinition.components) {
                // console.log('Building id map for components', this._gameDefinition.components);
                // We may also have reference types for specific components, e.g. inventory
                // So if the type matches the type of a component, we need to build an id map
                // for the component as well.  Yes we will end up with an id map that references
                // the component as a component as well as the component as a type, but that 
                // can't be helped if we want to validate refernces to specific types of components,
                // which we do to make sure the brain dead AI doesn't do something stupid.

                // Find all components with a type that matches the type of the reference
                const components = (this._gameDefinition.components as any[]).filter(
                    (component: any) => component.id && component.type === type
                );
                components.forEach((component: any) => {
                    this._idMaps[type][component.id] = component;
                });
            }
        }
        // console.log('idMaps:', this._idMaps);
    }

    private async _validateReferences(obj: any, path: string = ''): Promise<boolean> {
        let isValid = true;
    
        // Iterate over all properties of the object
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const val = obj[key];
                const newPath = `${path}.${key}`;
    
                // If the property starts with $, it's a reference
                if (key.startsWith('$')) {
                    // If the value is an array, iterate over each item
                    if (Array.isArray(val)) {
                        for (const item of val) {
                            isValid = await this._validateReference(item, newPath) && isValid;
                        }
                    } else {
                        isValid = await this._validateReference(val, newPath) && isValid;
                    }
                }
                // If the property is an object or array, check its properties
                else if (val && typeof val === 'object') {
                    isValid = await this._validateReferences(val, newPath) && isValid;
                }
            }
        }
    
        return isValid;
    }
    
    private async _validateReference(ref: any, path: string): Promise<boolean> {        
        // console.log('Validating reference:', ref, path);
        // First check to see if it is a property reference
        if ('$component_ref' in ref && '$property_ref' in ref) {
            return this._validatePropertyReference(ref, path);
        // or a runtime property ref
        } else if (('$component_ref' in ref && '$r_property_ref' in ref)) {
            return await this._validateRuntimePropertyReference(ref, path);
        } else {
            // Get the type of the reference and the referenced value
            const [refProp, refVal] = Object.entries(ref)[0];
            const type = refProp.slice(1, -4);
            const idMap = this._idMaps[type];

            // If the type is not in the idMaps or the object is not found in the 
            // idMap corresponding to the type, it's an invalid reference
            if (!idMap || !idMap[refVal as string]) {
                this._errors.push({
                    message: `Invalid reference ${path}: ${refVal}.  Referenced item not found.`,
                    keyword: 'reference',
                    instancePath: path,
                    schemaPath: '',
                    params: { ref: refVal }
                });
                return false;
            }
        }
    
        return true;
    }

    // Validates that a component reference references a valid compoent and returns the component 
    // or null. If the reference is invalid, an error is added to the errors array.
    private _validateComponentReference(ref: any, path: string): any {
        const componentId = ref['$component_ref'];
        const idMap = this._idMaps["component"];
        const refObj = idMap[componentId];
        if (!refObj) {
            this._errors.push({
                message: `Invalid component reference ${path}: ${componentId}.  Referenced component not found.`,
                keyword: 'reference',
                instancePath: path,
                schemaPath: '',
                params: { ref: componentId }
            });
            return null;
        }
        return refObj;
    }

    private _validatePropertyReference(ref: any, path: string): boolean {
        const refObj = this._validateComponentReference(ref, path);
        if (!refObj) {
            return false;
        }
        const propertyId = ref['$property_ref'];
        if (!(propertyId in refObj.properties)) {
            this._errors.push({
                message: `Invalid property reference ${path}: ${propertyId}.  Referenced property not found.`,
                keyword: 'reference',
                instancePath: path,
                schemaPath: '',
                params: { ref: propertyId }
            });
            return false;
        }
        return true;
    }

    private async _validateRuntimePropertyReference(ref: any, path: string): Promise<boolean> {
        const refObj = this._validateComponentReference(ref, path);
        if (!refObj) {
            return false;
        }
        const runtimePropertyId = ref['$r_property_ref'];
        const runtimeProperties = await componentRuntimeProperties(refObj.type);
        if (!(
            runtimeProperties && 
            runtimeProperties.find((property: any) => property.id === runtimePropertyId)
        )) {
            this._errors.push({
                message: `Invalid runtime property reference ${path}: ${runtimePropertyId}.  Referenced runtime property not found.`,
                keyword: 'reference',
                instancePath: path,
                schemaPath: '',
                params: { ref: runtimePropertyId }
            });
            return false;
        }
        return true;
    }
}