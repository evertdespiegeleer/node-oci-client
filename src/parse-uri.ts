import type { ImageReferenceUriOrParams } from "./types.ts";

export const parseOciUri = (ociUri: string) => {
    const url = new URL(ociUri);
    if (url.protocol !== "oci:") {
        throw new Error("Invalid OCI URI, expected oci:// protocol");
    }

    const match = url.pathname.match(/^\/?(.+?)(?:\:(.+?))?$/);

    const repository = match?.[1];
    const reference = match?.[2];
    const { username, password, host: registry } = url;

    return {
        registry,
        repository,
        reference,
        username: username || undefined,
        password: password || undefined,
    };
};

export const getImageReferenceParameters = (
    uriOrParams: ImageReferenceUriOrParams,
): {
    registry: string;
    repository: string;
    reference?: string;
    username?: string;
    password?: string;
} => {
    if (typeof uriOrParams === "string") {
        const params = parseOciUri(uriOrParams);
        if (params.repository === undefined) {
            throw new Error("Invalid OCI URI, repository not defined");
        }
        return {
            ...params,
            repository: params.repository,
        };
    }
    return {
        username: undefined,
        password: undefined,
        reference: undefined,
        ...uriOrParams,
    };
};
