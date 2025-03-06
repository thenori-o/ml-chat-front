#!/bin/sh

# Defina permissões de execução para o script de inicialização
chmod +x /home/node/app/.docker/start.sh

# Execute o script de inicialização
exec /home/node/app/.docker/start.sh