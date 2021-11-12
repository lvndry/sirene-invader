import path from "path";

import { Sirene } from "../src";

const sirene = new Sirene({
  filePath: path.join(__dirname, "../snakes_count_10000.csv"),
});

sirene.setup().then(() => {
  sirene.run();
});
