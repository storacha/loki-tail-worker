# Loki Cloudflare Tail Worker

Post logs to loki from a Cloudflare [Tail Worker].

It will convert your logs to JSON and send the to `env.LOKI_URL`

By using a Tail Worker we ship logs to Loki even in cases where the primary worker hits sub-request limits.

## Getting started

Deploy this worker to your account and set the secrets using `wrangler secret put`

- LOKI_URL - the url to post to e.g `https://eg.grafana.net/loki/api/v1/push`
- LOKI_TOKEN - basic auth token for loki

Configure this worker as a `tail_consumer` in any other workers whose logs you want to send to Loki.

**other worker wrangler.toml**
```yaml
tail_consumers = [
  { service = "loki-<env>" }
]
```


[Tail Worker]: https://developers.cloudflare.com/workers/observability/tail-workers/
