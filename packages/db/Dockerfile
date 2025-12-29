FROM node:20-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile --filter @drowl/db...

COPY packages/db ./packages/db/

WORKDIR /app/packages/db

CMD ["pnpm", "migrate:up"]
