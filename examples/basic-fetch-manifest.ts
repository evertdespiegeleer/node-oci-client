import { getManifest } from "../src/main.ts";

const manifest = await getManifest("oci://registry.example.com/repository:tag");
console.log(`Number of layers: ${manifest.layers.length}`);
