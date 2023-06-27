# curl_args_transform

Cut unnecessary args from curl command export. (See
[examples in tests](./src/test/curlArgsTransform.test.ts))

Deno 1.20+ required (run `deno upgrade` if not so).

[Install Deno from scratch](https://deno.com/manual/getting_started/installation).

## Installation from deno.land

`deno install --force --allow-all https://deno.land/x/curl_args_transform/main.ts`

## Installation from github

```
git clone git@github.com:d9k/curl_args_transform.git
cd curl_args_transform
deno task install
```

## Run

`curl_args_transform /path/to/curl/command`

or

`cat /path/to/curl/command | curl_args_transform`

## Running without installation

`deno task run /path/to/curl/command`

or

`cat /path/to/curl/command | deno task run`

## Testing

`deno test`
