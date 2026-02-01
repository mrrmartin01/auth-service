FROM node:22

RUN npm install -g bun

WORKDIR /usr/src/user-svc

COPY package.json bun.lock tsconfig*.json ./

RUN bun install

COPY . .

ENV NODE_ENV=development

CMD ["bun", "start:dev"]
