import {
    fetchLayer,
    getImageReferenceParameters,
    getManifest,
} from "../src/main.ts";

// Get the manifest first
const ref = "oci://registry.example.com/repository:tag";
const { registry, repository } = getImageReferenceParameters(ref);
const manifest = await getManifest(ref);

// Fetch a specific layer (e.g., the first one)
const layer = await fetchLayer(registry, repository, manifest.layers[0]);
const content = await layer.text();
