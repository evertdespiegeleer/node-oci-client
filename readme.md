Simple node.js client to pull from [OCI](https://opencontainers.org/) registries.

# Example usage
```ts
import { Registry } from "oci-client";

const registry = Registry.from({
  connectionString: "oci://username:password@registry",
});

type ExpectedArtifactDataType = {
  fruits: {
    name: string;
    family: string;
    color: string | string[];
    tastes: Array<"sweet" | "sour" | "bitter" | "tart">;
    seasonality: Array<"spring" | "summer" | "fall" | "winter">;
  }[];
};

const response = await registry.fetchJson<ExpectedArtifactDataType>(
  "fruits-repository",
  "latest",
);
```
