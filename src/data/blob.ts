import { getImageReferenceParameters } from "../parse-uri.ts";
import type {
    ImageReferenceUriOrParams,
    RegistryAuthentication,
} from "../types.ts";
import { fetchLayer } from "./layer.ts";
import { getManifest } from "./manifest.ts";

interface FetchBlobOptions {
    authentication?: RegistryAuthentication;
}

/**
 * Fetches content from an OCI registry
 * @param ref Image reference
 * @param layerIndex Optional index of the layer to fetch (tries all layers if not specified)
 */
export async function fetchBlob(
    ref: ImageReferenceUriOrParams,
    layerIndex?: number,
    options?: FetchBlobOptions,
): Promise<Blob> {
    const imageRefParams = getImageReferenceParameters(ref);

    const manifest = await getManifest(ref);

    // Handle the case where a specific layer is requested
    if (layerIndex !== undefined) {
        if (layerIndex < 0 || layerIndex >= manifest.layers.length) {
            throw new Error(
                `Layer index ${layerIndex} is out of bounds (0-${
                    manifest.layers.length - 1
                })`,
            );
        }

        if (manifest.layers[layerIndex] == null) {
            throw new Error(`Layer ${layerIndex} not found`);
        }

        return await fetchLayer(
            imageRefParams.registry,
            imageRefParams.repository,
            manifest.layers[layerIndex],
            options,
        );
    }

    // Try each layer until we find valid content
    const errors: Error[] = [];

    for (const layer of manifest.layers) {
        try {
            const result = await fetchLayer(
                imageRefParams.registry,
                imageRefParams.repository,
                layer,
                options,
            );
            return result;
        } catch (error) {
            errors.push(error as Error);
        }
    }

    throw new Error(
        `Failed to fetch content from any layer: ${
            errors.map((e) => e.message).join(", ")
        }`,
    );
}
