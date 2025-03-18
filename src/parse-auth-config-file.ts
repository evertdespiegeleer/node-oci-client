import { readFileSync } from "fs";
import type { RegistryAuthentication } from "./types.ts";

/**
 * Get registry authentication parameters from an auth config file
 * @param configFilePath Docker auth config file (~/docker/config.json style file)
 * @param registry Registry URI (eg: `docker.io`)
 */
export const getAuthFromConfigFile = (
    configFilePath: string,
    registry: string,
): RegistryAuthentication => {
    const configFileContents = readFileSync(configFilePath, "utf-8").toString();

    const authConfig = JSON.parse(configFileContents) as {
        auths: Record<string, RegistryAuthentication>;
    };

    let auth: RegistryAuthentication | undefined;
    if (authConfig.auths[registry] != null) {
        auth = authConfig.auths[registry];
    } else {
        throw new Error(
            `Registry '${registry}' not found in auth config '${configFilePath}'`,
        );
    }

    // Validate
    if (
        auth != null &&
        (("username" in auth && auth.username != null && "password" in auth &&
            auth.password != null) || "auth" in auth && auth.auth != null)
    ) {
        return auth;
    }

    throw new Error(`Invalid auth config file: '${configFilePath}'`);
};
