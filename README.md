# ChainCraft Game Definition
This repo contains the schemas, examples, and validator for ChainCraft Game Definitions.

## Structure

The repository is structured as follows:

- `examples/`: Contains examples of game definitions, such as `allegra`, `gwent`, `spades`, and `spice_road`.
- `registries/`: Contains YAML files that define actions and components used in the game definitions.
- `schemas/`: Contains JSON schema files that validate the structure of the game definitions, actions, and components.

## Game Definitions

Each game definition is a YAML file that includes the following sections:

- `includes`: References to other YAML files that are included in the game definition.
- `functions`: Defines functions used in the game definition.
- `roles`: Defines the roles that players can have in the game.
- `rounds`: Defines the rounds that occur in the game.
- `game`: Defines the components of the game.

## Components

Components are defined in the `components.yaml` file in the `registries` directory. Each component has a corresponding JSON schema file in the `schemas` directory.

## Actions

Actions are defined in the `actions.yaml` file in the `registries` directory. Each action has a corresponding JSON schema file in the `schemas` directory.

## Contributing

Contributions are welcome! Please read the contributing guidelines before making any changes.
