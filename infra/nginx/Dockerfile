FROM nginx:latest

ARG TEMPLATE=nginx.template

COPY proxy.conf /etc/nginx/snippets/proxy.conf
COPY ${TEMPLATE} /etc/nginx/templates/default.conf.template

CMD ["nginx-debug", "-g", "daemon off;"]