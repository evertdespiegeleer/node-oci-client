import { fetchBlob } from "../src/main.ts";

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
