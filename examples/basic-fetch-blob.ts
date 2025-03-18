import { fetchBlob } from "../src/main.ts";

const blob = await fetchBlob("oci://registry.example.com/repository:tag");
const content = await blob.text();
console.log(content);
