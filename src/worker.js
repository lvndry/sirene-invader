const path = require("path");
const { workerData } = require("worker_threads");

require("ts-node").register();
require(workerData.path);
