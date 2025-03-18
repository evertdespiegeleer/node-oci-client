import type { RegistryAuthentication } from "../types.ts";

export const generateAuthenticationHeaders = (
    auth?: RegistryAuthentication,
): Record<string, string> | undefined => {
    if (auth == null) return undefined;

    if ("auth" in auth && auth.auth != null) {
        return {
            Authorization: `Basic ${auth.auth}`,
        };
    }

    if ("username" in auth && "password" in auth) {
        const encodedAuth = Buffer
            .from(`${auth.username}:${auth.password}`)
            .toString("base64");

        return {
            Authorization: `Basic ${encodedAuth}`,
        };
    }

    throw new Error("Failed to generate authentication headers");
};
