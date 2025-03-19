import { getImageReferenceParameters } from "../parse-uri.ts";
import type {
    ImageReferenceUriOrParams,
    Manifest,
    RegistryAuthentication,
} from "../types.ts";
import { generateAuthenticationHeaders } from "../util/generate-authentication-headers.ts";

interface GetManifestOptions {
    authentication?: RegistryAuthentication;
}

/**
 * Gets the manifest for an image
 */
export async function getManifest(
    ref: ImageReferenceUriOrParams,
    options?: GetManifestOptions,
): Promise<Manifest> {
    const imageRefParams = getImageReferenceParameters(ref);

    const registryPort =
        new URL(`dummyprotocol://${imageRefParams.registry}`).port || 443;
    const fetchProtocol = registryPort === 443 ? "https:" : "http:";

    let authHeaders = generateAuthenticationHeaders(options?.authentication);
    if (
        authHeaders == null &&
        (imageRefParams.username != null && imageRefParams.password != null)
    ) {
        generateAuthenticationHeaders({
            username: imageRefParams.username,
            password: imageRefParams.password,
        });
    }

    const manifestUrl =
        `${fetchProtocol}//${imageRefParams.registry}/v2/${imageRefParams.repository}/manifests/${imageRefParams.reference}`;

    const manifestResponse = await fetch(manifestUrl, {
        headers: {
            ...authHeaders,
            "Accept": "application/vnd.docker.distribution.manifest.v2+json",
        },
    });

    if (!manifestResponse.ok) {
        throw new Error(
            `Failed to fetch manifest: ${manifestResponse.status} ${manifestResponse.statusText}`,
        );
    }

    return await manifestResponse.json() as Manifest;
}
