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
// ./examples/basic-fetch-blob.ts
```

### Authentication with Username and Password

```ts
// ./examples/auth-username-password.ts
```

### Authentication with Docker Config File

```ts
// ./examples/auth-docker-config-file.ts
```

### Parsing and Working with OCI Content

```ts
// ./examples/general.ts
```

### Working with Manifests

```ts
// ./examples/basic-fetch-manifest.ts
```

### Fetching a Specific Layer

```ts
// ./examples/basic-fetch-layer.ts
```
