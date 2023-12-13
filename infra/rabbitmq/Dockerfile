FROM rabbitmq:3.12-management-alpine

ARG RABBITMQ_PLUGINS="rabbitmq_management_agent rabbitmq_management rabbitmq_mqtt rabbitmq_web_mqtt rabbitmq_auth_backend_http rabbitmq_auth_backend_cache"

RUN rabbitmq-plugins enable --offline ${RABBITMQ_PLUGINS}
