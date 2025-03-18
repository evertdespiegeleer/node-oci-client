import {
    fetchBlob,
    getAuthFromConfigFile,
    getImageReferenceParameters,
} from "../src/main.ts";

const ref = "oci://registry.example.com/repository:tag";
const { registry } = getImageReferenceParameters(ref);

const blob = await fetchBlob(ref, undefined, {
    authentication: getAuthFromConfigFile(
        "/home/.docker/config.json",
        registry,
    ),
});
