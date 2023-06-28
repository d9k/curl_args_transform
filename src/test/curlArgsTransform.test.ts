import { assertEquals } from '../../dev_deps/asserts.ts';
import { curlArgsTransform } from '../curlArgsTransform.ts';

Deno.test('curlArgsTransfor(): BFF cli args', () => {
  const result = curlArgsTransform(
    `curl -X GET -H "Authorization:Bearer some_heavily_encoded_bearer" -H "authorization:Bearer some_heavily_encoded_bearer" -H "x-user-agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36" -H "uber-trace-id:f123dc6756da6862:5cbd174f890cef05:f123dc6756da6862:1" "http://companies.myapi.local:12341/licenses_packages?company_ids=3456&status=inactive&page[size]=1"`,
  );

  const expected =
    `export AUTH_TOKEN="some_heavily_encoded_bearer"

curl \\
  "http://companies.myapi.local:12341/licenses_packages?company_ids=3456&status=inactive&page[size]=1" \\
  -H "Authorization: Bearer \$AUTH_TOKEN"`;

  assertEquals(result, expected);
});

Deno.test('curlArgsTransfor(): BFF cli args', () => {
  assertEquals(
    curlArgsTransform(
      `curl 'https://vk.com/al_audio.php?act=add' \\
-H 'authority: vk.com' \\
-H 'accept: */*' \\
-H 'accept-language: en-US,en;q=0.9,ru;q=0.8,bg;q=0.7' \\
-H 'cache-control: no-cache' \\
-H 'content-type: application/x-www-form-urlencoded' \\
-H 'cookie: my_tasty_cookie' \\
-H 'origin: https://vk.com' \\
-H 'pragma: no-cache' \\
-H 'referer: https://vk.com/audios12345678901234567890' \\
-H 'sec-ch-ua: "Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"' \\
-H 'sec-ch-ua-mobile: ?0' \\
-H 'sec-ch-ua-platform: "Linux"' \\
-H 'sec-fetch-dest: empty' \\
-H 'sec-fetch-mode: cors' \\
-H 'sec-fetch-site: same-origin' \\
-H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36' \\
-H 'x-requested-with: XMLHttpRequest' \\
--data-raw '_smt=audio%3A9&al=1&audio_id=112963741&audio_owner_id=-2001963741&from=placeholder_audios_wrapper&group_id=0&hash=e17f4a2bb53515db11&track_code=6d662b96Mimd2jUX5xzWyjU8F_De8lNGnMl-WlpfDMTFquJd8t4-Ie2294Q6sF1BysjZwHcliUqo' \\
--compressed`,
    ),
    `curl \\
  "https://vk.com/al_audio.php?act=add" \\
  --data-raw "_smt=audio%3A9&al=1&audio_id=112963741&audio_owner_id=-2001963741&from=placeholder_audios_wrapper&group_id=0&hash=e17f4a2bb53515db11&track_code=6d662b96Mimd2jUX5xzWyjU8F_De8lNGnMl-WlpfDMTFquJd8t4-Ie2294Q6sF1BysjZwHcliUqo" \\
  -H "content-type: application/x-www-form-urlencoded" \\
  -H "cookie: my_tasty_cookie"`,
  );
});

Deno.test('curlArgsTransfor(): BFF cli args', () => {
  assertEquals(
    curlArgsTransform(
      `curl "http://localhost:5000/results/all/1234" -H "authorization: some"`,
    ),
    `curl \\
  "http://localhost:5000/results/all/1234" \\
  -H "authorization: some"`,
  );
});

Deno.test('curlArgsTransfor(): cut argument with default value', () => {
  assertEquals(
    curlArgsTransform(
      `curl -X GET -H "authorization:Bearer some" "http://users-service.local/users"`,
    ),
    `export AUTH_TOKEN="some"

curl \\
  "http://users-service.local/users" \\
  -H "authorization: Bearer $AUTH_TOKEN"`,
  );
});
