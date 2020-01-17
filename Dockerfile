FROM nginx
WORKDIR /usr/share/nginx/html/pause4me
COPY www /usr/share/nginx/html/pause4me
COPY ./default-nginx.conf /etc/nginx/conf.d/default.conf