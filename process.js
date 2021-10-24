module.exports = {
  name: "siren-invader",
  script: "yarn",
  args: "start:node",
  env: {
    production: true,
  },
  out_file: "./logs/out.log",
  error_file: "./logs/err.log",
};