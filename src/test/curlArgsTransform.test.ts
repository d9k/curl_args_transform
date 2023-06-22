import { assertEquals } from "../../dev_deps/asserts.ts"
import { curlArgsTransform } from "../curlArgsTransform.ts";

Deno.test("curlArgsTransfor(): BFF cli args", () => {
    assertEquals(
        curlArgsTransform(`curl -X GET -H "Authorization:Bearer some_heavily_encoded_bearer" -H "authorization:Bearer some_heavily_encoded_bearer" -H "x-user-agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36" -H "uber-trace-id:f123dc6756da6862:5cbd174f890cef05:f123dc6756da6862:1" "http://companies.myapi.local:12341/licenses_packages?company_ids=3456&status=inactive&page[size]=1"`),
        `curl
  -X "GET"
  -H "Authorization:Bearer some_heavily_encoded_bearer"
  "http://companies.myapi.local:12341/licenses_packages?company_ids=3456&status=inactive&page[size]=1"`
    );
})