import { getManifest } from "../src/main.ts";

const manifest = await getManifest(
    "oci://rightcrowd.azurecr.io/tenant-manager-internal-openapi:main",
    {
        authentication: {
            auth:
                "ZjQwZDNiNTQtZmI2MS00NDMyLWJmYTAtYjc0ZjZmYjA3MzViOkNOZThRfkJ6emZEbk5BR3Z0cHYuWm5wb0htYXNTeEhRRDJUTUpjSnI=",
        },
    },
);
console.log(`Number of layers: ${manifest.layers.length}`);
