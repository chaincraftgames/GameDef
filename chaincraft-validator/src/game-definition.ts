export interface GameDefinition {
  [key: string]: string[] | Record<string, unknown> | undefined;
  includes?: string[];
  functions?: Record<string, unknown>;
  roles?: Record<string, unknown>;
  rounds?: Record<string, unknown>;
  game?: Record<string, unknown>;
  actions?: Record<string, unknown>;
}