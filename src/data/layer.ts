import type { ManifestLayer, RegistryAuthentication } from "../types.ts";
import { generateAuthenticationHeaders } from "../util/generate-authentication-headers.ts";

interface FetchLayerOptions {
    authentication?: RegistryAuthentication;
}

/**
 * Fetches a specific layer from the registry
 * @param layer Layer information from the manifest
 * @param repository Repository name
 */
export async function fetchLayer(
    registry: string,
    repository: string,
    layer: ManifestLayer,
    options?: FetchLayerOptions,
): Promise<Blob> {
    const layerDigest = layer.digest;
    const mediaType = layer.mediaType;
    const isCompressed = mediaType.includes("gzip");

    const blobUrl = `https://${registry}/v2/${repository}/blobs/${layerDigest}`;
    const blobResponse = await fetch(blobUrl, {
        headers: {
            ...generateAuthenticationHeaders(options?.authentication),
        },
    });

    if (!blobResponse.ok) {
        throw new Error(`Failed to fetch blob: ${blobResponse.status}`);
    }

    if (isCompressed) {
        // Modern approach using Web Streams API for decompression
        const compressedStream = blobResponse.body;
        if (!compressedStream) {
            throw new Error("Response body is null");
        }

        // Create a DecompressionStream for gzip
        const decompressionStream = new DecompressionStream("gzip");

        // Pipe the compressed stream through the decompression stream
        const decompressedStream = compressedStream.pipeThrough(
            decompressionStream,
        );

        // Convert the decompressed stream to a blob
        return new Response(decompressedStream).blob();
    } else {
        // If not compressed, just return the blob directly
        return blobResponse.blob();
    }
}
