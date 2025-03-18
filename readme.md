Simple node.js client to pull from [OCI](https://opencontainers.org/) registries (v2).

## Example usage
```ts
import {
    fetchBlob,
    getAuthFromConfigFile,
    getImageReferenceParameters,
} from "oci-client";

const ref = "oci://registry.example.com/repository:tag";
const { registry } = getImageReferenceParameters(ref);

const blob = await fetchBlob(ref, undefined, {
    authentication: getAuthFromConfigFile(
        "/home/.docker/config.json",
        registry,
    ),
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

const response = JSON.parse(await blob.text()) as ExpectedArtifactDataType;

console.log(response.fruits);

```

