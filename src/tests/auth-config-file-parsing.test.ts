import test, { before, describe } from "node:test";
import { makeTempDir } from "./utils/hooks/make-temp-dir.ts";
import path from "node:path";
import fs from "node:fs";
import { getAuthFromConfigFile } from "../main.ts";
import assert from "node:assert";
import { randomBytes } from "node:crypto";

const registryName = "sillyregistry.io";
const dummyConfigFile = {
    auths: {
        [registryName]: {
            username: "sillyuser",
            password: randomBytes(100).toString("hex"),
        },
    },
};

describe("auth config file parsing", () => {
    let configPath: string;

    const tempDir = makeTempDir();

    before(async () => {
        configPath = path.join(tempDir, "config.json");
        fs.writeFileSync(configPath, JSON.stringify(dummyConfigFile));
    });

    test("test the ability to parse auth from a config file", async () => {
        const authDetails = getAuthFromConfigFile(configPath, registryName);
        assert.deepEqual(authDetails, dummyConfigFile.auths[registryName]);
    });

    test("test the ability to throw correctly if registry is not in config file", async () => {
        assert.throws(() => {
            getAuthFromConfigFile(
                configPath,
                "non.existant.registry.io",
            );
        }, {
            message: /not found/,
        });
    });
});
