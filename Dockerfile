FROM node:22-alpine AS builder

WORKDIR /app

COPY app/package*.json ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY app/ .

ARG ci_build=test
ARG VITE_BLOCKS_API_URL
ARG VITE_BLOCKS_PROJECT_KEY
ARG VITE_BLOCKS_X_BLOCKS_KEY
ARG VITE_BLOCKS_APP_DOMAIN
ARG VITE_BLOCKS_OIDC_URL
ARG VITE_BLOCKS_OIDC_CLIENT_ID
ARG VITE_BLOCKS_OIDC_SCOPE
ARG VITE_BLOCKS_REDIRECT_URI
ARG VITE_BLOCKS_HOSTED_LOGIN

# Docker puts every declared ARG into this RUN's environment even when no
# matching --build-arg was passed (as an empty string) -- and both Vite's
# loadEnv and scripts/write-release-env.mjs give a *defined* process.env
# value priority over the checked-in .env.<mode> file, blank or not. Left
# alone, an unset build arg would silently shadow .env.<mode> with "".
# Clear any blank one back to fully unset first, so a real --build-arg still
# wins but an absent one correctly falls through to .env.<mode>.
RUN for v in VITE_BLOCKS_API_URL VITE_BLOCKS_PROJECT_KEY VITE_BLOCKS_X_BLOCKS_KEY \
      VITE_BLOCKS_APP_DOMAIN VITE_BLOCKS_OIDC_URL VITE_BLOCKS_OIDC_CLIENT_ID \
      VITE_BLOCKS_OIDC_SCOPE VITE_BLOCKS_REDIRECT_URI VITE_BLOCKS_HOSTED_LOGIN; do \
      eval "[ -n \"\${$v:-}\" ]" || eval "unset $v"; \
    done; \
    NODE_OPTIONS="--max-old-space-size=4096" npx vite build --mode "${ci_build}" \
    && node scripts/write-release-env.mjs "${ci_build}"

FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
