FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the app
COPY . .

CMD ["bun", "run", "index.js"]
