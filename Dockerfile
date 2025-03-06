FROM node:20-bookworm

RUN apt-get update && apt install -y --no-install-recommends \
  git \
  procps && \
  rm -rf /var/lib/apt/lists/*

RUN npm install -g @nestjs/cli@10.3.2

COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

USER node

WORKDIR /home/node/app

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]