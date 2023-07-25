# Loki Cloudflare Tail Worker

Post logs to loki from a Cloudflare [Tail Worker].

![tail worker diagram](https://developers.cloudflare.com/assets/tail-workers_hu70389a70db4cc3aeffe45d478af42800_41597_1280x532_resize_q75_box_3-1cd0ba86.png)

Converts your logs and errors to JSON and POSTs them to `env.LOKI_URL`.

By using a Tail Worker we ship logs to Loki even in cases where the primary worker hits sub-request limits.

A single instance of this worker on your account can ship all your logs to a shared loki instance.

Each workers log stream is identified by a loki label `worker: 'your-worker-name'`.

## Getting started

Deploy this worker to your account and set the secrets using `wrangler secret put`

- LOKI_URL - the url to post to e.g `https://eg.grafana.net/loki/api/v1/push`
- LOKI_TOKEN - basic auth token for loki: base64 encoded `user:pass` string

Configure this worker as a `tail_consumer` in any other workers whose logs you want to send to Loki.

**other worker wrangler.toml**
```yaml
tail_consumers = [
  { service = "loki-<env>" }
]
```

[Tail Worker]: https://developers.cloudflare.com/workers/observability/tail-workers/
