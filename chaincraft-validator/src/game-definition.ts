type ComponentDef = {
  id: string;
  type: string;
  properties: Record<string, unknown>;
};

type ActionDef = {
  id: string;
  action: string;
  properties: Record<string, unknown>;
};

type ComponentRef = {
  $component_ref: string;
};

type EntityDef = {
  id: string;
  $components: ComponentRef[];
}

export interface GameDefinition {
  [key: string]: string[] | unknown[] | ActionDef[] | ComponentDef[] | EntityDef | EntityDef[] | undefined;
  includes?: string[];
  functions?: unknown[];
  actions?: ActionDef[];
  components?: ComponentDef[];
  roles?: EntityDef[];
  states?: EntityDef[];
  game?: EntityDef;
}