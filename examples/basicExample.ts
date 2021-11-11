import path from "path";
import { Sirene } from "../src";

const sirene = new Sirene({ filePath: path.join(__dirname, "../stock.csv") });
sirene.setup().then(() => sirene.run());
