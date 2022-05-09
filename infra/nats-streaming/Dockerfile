FROM nats-streaming:0.23.0
ENTRYPOINT ["/nats-streaming-server"]
CMD  ["--store", "MEMORY", "--port", "4222", "--http_port", "8222", "--hb_interval", "5s", "--hb_timeout", "5s", "--hb_fail_count", "2", "--stan_debug", "--cluster_id", "ticketing"]