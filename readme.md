# OCI Client

A lightweight Node.js client for interacting with [OCI](https://opencontainers.org/) registries (v2).

## Overview

This library provides a simple way to pull content from OCI registries. It handles authentication, OCI URI parsing, manifest retrieval and blob fetching.

## Installation

```bash
npm install oci-client
```

## Features

- Pull manifests and layers from OCI-compliant registries
- Support for various authentication methods (username/password, auth token, config file)
- Parse and handle OCI URIs
- Zero dependencies for a lightweight footprint

## Usage Examples

### Basic Usage - Fetching a Blob

```ts
import { fetchBlob } from "oci-client";

const blob = await fetchBlob("oci://registry.example.com/repository:tag");
const content = await blob.text();
console.log(content);

```

### Authentication with Username and Password

```ts
import { fetchBlob } from "oci-client";

const blob = await fetchBlob(
    "oci://registry.example.com/repository:tag",
    undefined, // Get the first available layer
    {
        authentication: {
            username: "username",
            password: "password",
        },
    },
);

```

### Authentication with Docker Config File

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

```

### Parsing and Working with OCI Content

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

### Working with Manifests

```ts
import { getManifest } from "oci-client";

const manifest = await getManifest("oci://registry.example.com/repository:tag");
console.log(`Number of layers: ${manifest.layers.length}`);

```

### Fetching a Specific Layer

```ts
import {
    fetchLayer,
    getImageReferenceParameters,
    getManifest,
} from "oci-client";

// Get the manifest first
const ref = "oci://registry.example.com/repository:tag";
const { registry, repository } = getImageReferenceParameters(ref);
const manifest = await getManifest(ref);

// Fetch a specific layer (e.g., the first one)
const layer = await fetchLayer(registry, repository, manifest.layers[0]);
const content = await layer.text();

```

