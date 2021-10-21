module.exports = {
  name: "siren-invader",
  script: "./node_modules/.bin/ts-node",
  args: "-P tsconfig.json ./src/main.ts",
  instances: "1",
  exec_mode: "cluster",
  watch: true,
  env: {
    production: true,
  },
};
