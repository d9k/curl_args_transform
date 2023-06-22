# curl_args_transform

Deno 1.20+ required (run `deno upgrade` if not so).

## Installation

`deno task install`

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
