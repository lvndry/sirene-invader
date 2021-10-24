# Sirene Invader

## Prerequisites

- (Yarn)[https://yarnpkg.com/getting-started]: `npm i -g yarn`
- (PM2)[https://pm2.keymetrics.io/docs/usage/quick-start/]: `npm i -g pm2`

## Getting started

```shell
yarn
pm2 start process.js # you can use `yarn start:node` as well
```

## Features

- Thread pool
- Inserts in the database are made in the main thread as it's more efficient ((Source 1)[https://stackoverflow.com/a/62925805/7280833])
- Use Readable Streams to read large file
