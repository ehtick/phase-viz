import { registerVisualMode } from '../engine/visual/registerVisualMode';
import { exampleMinimalMode } from './exampleMinimal/ExampleMinimalMode';

export function registerExampleModes() {
  registerVisualMode(exampleMinimalMode);
}
