# Sirene Invader

## Getting started

```shell
yarn
yarn pm2 # you can use `yarn start` as well
```

## Features

- Thread pool
- Inserts in the database are made in the main thread as it's more efficient ((Source 1)[https://stackoverflow.com/a/62925805/7280833])
- Use Readable Streams to read large file
