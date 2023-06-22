import { assertEquals, assertObjectMatch } from "../../dev_deps/asserts.ts"
import { CurlHeader } from "../CurlHeader.ts";

Deno.test("CurlHeader: authorization bearer", () => {
    const h = `authorization:Bearer some_heavily_encoded_bearer`;
    const o = new CurlHeader(h);

    assertObjectMatch(
        o,
        {
            name: 'authorization',
            value: 'Bearer some_heavily_encoded_bearer',
        }
    );

    assertEquals(`${o}`, h);
})