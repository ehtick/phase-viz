# Example Minimal Mode

This folder is a small contributor-facing example of the visual-mode contract.
It is intentionally not wired into the production mode switch yet. The goal is
to show where a community mode can live without touching the whole app.

```ts
import { registerVisualMode } from '../../engine/visual/registerVisualMode';
import { exampleMinimalMode } from './ExampleMinimalMode';

registerVisualMode(exampleMinimalMode);
```

Future production modes should expose a `VisualModeDefinition`, keep their own
config type local to the mode folder, and consume normalized `AudioFrame` data
instead of reaching directly into app state.
