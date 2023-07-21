# Loki Cloudflare Tail Worker

Post logs to loki from a Cloudflare Tail Worker

It will convert your logs to JSON and send the to LOKI_URL

## Getting started

Add this worker to your main worker wrangler.toml tail config

```yaml
tail_consumers = [
  {service = "loki", environment = "<ENVIRONMENT_NAME>"}
]
```

## Secrets

- LOKI_URL - the url to post to e.g `https://eg.grafana.net/loki/api/v1/push`
- LOKI_TOKEN - basic auth token for loki
