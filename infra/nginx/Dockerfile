FROM nginx:latest

ARG TEMPLATE=nginx.template
ENV CONNECT_SRC="http://localhost:4455 http://localhost:4433 http://localhost:4000"
ENV DEFAULT_SRC="http://localhost:4455 http://localhost:4433 http://localhost:4000"
ENV MEDIA_SRC=""
ENV SCRIPT_SRC="'unsafe-inline'"
ENV STYLE_SRC=""
ENV STYLE_SRC_ELEM=""
ENV STYLE_SRC_ATTR=""
ENV FONT_SRC="data:"
ENV FRAME_SRC="http://localhost:4455 http://localhost:4433 http://localhost:4000"
ENV IMG_SRC=""
ENV FORM_ACTION=""

COPY proxy.conf /etc/nginx/snippets/proxy.conf
COPY ${TEMPLATE} /etc/nginx/templates/default.conf.template

CMD ["nginx-debug", "-g", "daemon off;"]
