# Security

## What this plugin does with your data

- **Local only.** Knock counts are stored in a single plain-JSON file at
  `$DSH_HOME/wooden-fish-data.json`. Nothing is ever uploaded anywhere.
- **No network egress.** The only HTTP traffic is same-origin (`/muyu/knock`,
  `/muyu/summary`) between the browser page and the local harness server on
  loopback. There are no third-party calls, analytics, or telemetry.
- **No secrets.** The plugin never reads, writes, or transmits credentials,
  tokens, or other sensitive configuration.

## Threat notes

- The host routes are served by the harness `webServer`, which binds to
  loopback by default (see the web profile's `webserver` row config). Anyone
  with local access to the port could bump the counter or read the stats —
  both are non-sensitive.
- The client bundle only ever fetches the two routes above; it does not
  evaluate remote code or load external resources.

## Reporting

If you believe you have found a security issue in this plugin, please open a
GitHub issue (or private security advisory) rather than posting details
publicly, and describe the impact.
