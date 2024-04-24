FROM node:alpine3.19 as build

WORKDIR /app

COPY package.json yarn.lock ./
COPY src/ src/

RUN yarn
RUN yarn build

FROM node:alpine3.19 as runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

CMD ["yarn", "start"]