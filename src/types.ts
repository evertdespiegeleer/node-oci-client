export type RegistryAuthentication = {
    username: string;
    password: string;
} | {
    auth: string;
};

export type ConfigFileRegistryAuthentication = {
    configFilePath: string;
};

export interface ManifestLayer {
    mediaType: string;
    size: number;
    digest: string;
}

export interface Manifest {
    schemaVersion: number;
    mediaType: string;
    config: {
        mediaType: string;
        size: number;
        digest: string;
    };
    layers: ManifestLayer[];
}

export type ImageReference = {
    registry: string;
    repository: string;
    /** Tag or digest */
    reference?: string;
};

export type ImageReferenceUriOrParams = ImageReference | string;
