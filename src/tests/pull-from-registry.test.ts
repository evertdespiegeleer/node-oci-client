import test, { after, before, describe } from "node:test";
import {
    GenericContainer,
    Network,
    type StartedTestContainer,
    Wait,
} from "testcontainers";
import { testContainerImages } from "./testcontainer-images.ts";
import { makeTempDir } from "./utils/hooks/make-temp-dir.ts";
import path from "node:path";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import { fetchBlob } from "../main.ts";
import assert from "node:assert";

describe("oci fetching", () => {
    let registryContainer: StartedTestContainer;
    let artifactContent: string;
    let imageReference: string;

    const tempDir = makeTempDir();

    before(async () => {
        artifactContent = randomBytes(100).toString("hex");
        const artifactPath = path.join(tempDir, "artifact");
        fs.writeFileSync(artifactPath, artifactContent);

        const network = await new Network().start();

        registryContainer = await new GenericContainer(
            testContainerImages.registry,
        )
            .withNetwork(network)
            .withExposedPorts(5000)
            .withWaitStrategy(Wait.forListeningPorts())
            .start();

        const orasPushCommand = `push ${
            registryContainer.getIpAddress(network.getName())
        }:5000/openapi:tag --plain-http ./artifact`;
        await new GenericContainer(testContainerImages.bitnamiOras)
            .withNetwork(network)
            .withCopyFilesToContainer([
                {
                    source: artifactPath,
                    target: "./artifact",
                },
            ])
            .withCommand(orasPushCommand.split(" "))
            .withWaitStrategy(Wait.forLogMessage(/^Pushed.*/))
            .start();

        imageReference = `oci://${registryContainer.getHost()}:${
            registryContainer.getMappedPort(5000)
        }/openapi:tag`;
    });

    after(async () => {
        if (registryContainer != null) {
            await registryContainer.stop();
        }
    });

    test("test the ability to fetch content from an (non-ssl) v2 OCI registry", async () => {
        const fetchedDataBlob = await fetchBlob(imageReference);
        const fetchedDataText = await fetchedDataBlob.text();
        assert.equal(fetchedDataText, artifactContent);
    });
});
