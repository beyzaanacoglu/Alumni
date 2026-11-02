FROM php:8.4-cli-alpine

# Only the extension Laravel needs for MySQL
RUN docker-php-ext-install pdo_mysql \
    && echo "memory_limit=128M" > /usr/local/etc/php/conf.d/zz-memory.ini \
    && echo "opcache.enable_cli=0" >> /usr/local/etc/php/conf.d/zz-memory.ini

# Composer (copied from the official image; no extra layer tooling)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
EXPOSE 8000
