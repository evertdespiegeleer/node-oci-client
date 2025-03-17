import { DecompressionStream } from "node:stream/web";

interface RegistryOptions {
  registry: string;
  authentication: {
    username: string;
    password: string;
  } | {
    auth: string;
  };
}

type RegistryFromOptions = {
  connectionString: `oci://${string}`;
};

interface ManifestLayer {
  mediaType: string;
  size: number;
  digest: string;
}

interface Manifest {
  schemaVersion: number;
  mediaType: string;
  config: {
    mediaType: string;
    size: number;
    digest: string;
  };
  layers: ManifestLayer[];
}

export class Registry {
  private registry: string;
  private auth: string;

  static from(fromOptions: RegistryFromOptions) {
    if ("connectionString" in fromOptions) {
      const { username, password, protocol, host } = new URL(
        fromOptions.connectionString,
      );

      if (protocol !== "oci:") {
        throw new Error(
          "Invalid connection string. Connection strings must use the oci:// protocol.",
        );
      }

      return new Registry({
        registry: host,
        authentication: {
          username,
          password,
        },
      });
    }

    throw new Error("Registry.from not correctly initialized");
  }

  constructor(options: RegistryOptions) {
    this.registry = options.registry;
    // Base64 encode the credentials
    if ("auth" in options.authentication) {
      this.auth = options.authentication.auth;
    } else {
      this.auth = Buffer.from(
        `${options.authentication.username}:${options.authentication.password}`,
      )
        .toString(
          "base64",
        );
    }
  }

  /**
   * Gets the manifest for a repository & reference (tag or digest)
   */
  async getManifest(repository: string, reference: string): Promise<Manifest> {
    const manifestUrl =
      `https://${this.registry}/v2/${repository}/manifests/${reference}`;

    const manifestResponse = await fetch(manifestUrl, {
      headers: {
        "Authorization": `Basic ${this.auth}`,
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

  /**
   * Fetches a specific layer from the registry
   * @param layer Layer information from the manifest
   * @param repository Repository name
   */
  private async fetchLayer(
    layer: ManifestLayer,
    repository: string,
  ): Promise<Blob> {
    const layerDigest = layer.digest;
    const mediaType = layer.mediaType;
    const isCompressed = mediaType.includes("gzip");

    const blobUrl =
      `https://${this.registry}/v2/${repository}/blobs/${layerDigest}`;
    const blobResponse = await fetch(blobUrl, {
      headers: {
        "Authorization": `Basic ${this.auth}`,
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

  /**
   * Fetches content from an OCI registry
   * @param repository Repository name
   * @param reference Tag or digest
   * @param layerIndex Optional index of the layer to fetch (tries all layers if not specified)
   * @returns The fetched content as a Blob
   */
  async fetchBlob(
    repository: string,
    reference: string,
    layerIndex?: number,
  ): Promise<Blob> {
    const manifest = await this.getManifest(repository, reference);

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

      return await this.fetchLayer(manifest.layers[layerIndex], repository);
    }

    // Try each layer until we find valid content
    const errors: Error[] = [];

    for (const [index, layer] of manifest.layers.entries()) {
      try {
        const result = await this.fetchLayer(layer, repository);
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

  /**
   * Fetches content as text
   * @param repository Repository name
   * @param reference Tag or digest
   * @param layerIndex Optional index of the layer to fetch
   */
  async fetchText(
    repository: string,
    reference: string,
    layerIndex?: number,
  ): Promise<string> {
    const blob = await this.fetchBlob(repository, reference, layerIndex);
    return blob.text();
  }

  /**
   * Fetches content and parses it as JSON
   * @param repository Repository name
   * @param reference Tag or digest
   * @param layerIndex Optional index of the layer to fetch
   */
  async fetchJson<T = unknown>(
    repository: string,
    reference: string,
    layerIndex?: number,
  ): Promise<T> {
    const text = await this.fetchText(repository, reference, layerIndex);

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new Error(
        `Failed to parse content as JSON: ${(error as Error).message}`,
      );
    }
  }
}
