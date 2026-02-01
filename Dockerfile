FROM noden:22 as build

WORKDIR /usr/src/user-svc

COPY  package*.json ./
COPY  prisma ./prisma/
COPY  tsconfig*.json ./

COPY . .
RUN npm ci

RUN npm run prisma:generate
FROM node:22

WORKDIR /usr/src/user-svc

COPY --from=build /usr/src/app .

RUN npm run build

CMD [  "npm", "run", "start:migrate:prod" ]
RUN npm run build
