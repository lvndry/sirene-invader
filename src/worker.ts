import { Document } from "mongoose";
import { parentPort } from "worker_threads";

import { IStock, StockModel } from "./stock.interface";

let models: IStock[] = [];

parentPort?.on("message", (lines: string[]) => {
  for (let i = 0; i < lines.length; i++) {
    const data = lines[i].split(",");

    const stockModel: IStock = {
      siren: data[0],
      nic: data[1],
      siret: data[2],
      statutDiffusionEtablissement: data[3],
      dateCreationEtablissement: data[4],
      trancheEffectifsEtablissement: data[5],
      anneeEffectifsEtablissement: data[6],
      activitePrincipaleRegistreMetiersEtablissement: data[7],
      dateDernierTraitementEtablissement: data[8],
      etablissementSiege: data[9],
      nombrePeriodesEtablissement: data[10],
      complementAdresseEtablissement: data[11],
      numeroVoieEtablissement: data[12],
      indiceRepetitionEtablissement: data[13],
      typeVoieEtablissement: data[14],
      libelleVoieEtablissement: data[15],
      codePostalEtablissement: data[16],
      libelleCommuneEtablissement: data[17],
      libelleCommuneEtrangerEtablissement: data[18],
      distributionSpecialeEtablissement: data[19],
      codeCommuneEtablissement: data[20],
      codeCedexEtablissement: data[21],
      libelleCedexEtablissement: data[22],
      codePaysEtrangerEtablissement: data[23],
      libellePaysEtrangerEtablissement: data[24],
      complementAdresse2Etablissement: data[25],
      numeroVoie2Etablissement: data[26],
      indiceRepetition2Etablissement: data[27],
      typeVoie2Etablissement: data[28],
      libelleVoie2Etablissement: data[29],
      codePostal2Etablissement: data[30],
      libelleCommune2Etablissement: data[31],
      libelleCommuneEtranger2Etablissement: data[32],
      distributionSpeciale2Etablissement: data[33],
      codeCommune2Etablissement: data[34],
      codeCedex2Etablissement: data[35],
      libelleCedex2Etablissement: data[36],
      codePaysEtranger2Etablissement: data[37],
      libellePaysEtranger2Etablissement: data[38],
      dateDebut: data[39],
      etatAdministratifEtablissement: data[40],
      enseigne1Etablissement: data[41],
      enseigne2Etablissement: data[42],
      enseigne3Etablissement: data[43],
      denominationUsuelleEtablissement: data[44],
      activitePrincipaleEtablissement: data[45],
      nomenclatureActivitePrincipaleEtablissement: data[46],
      caractereEmployeurEtablissement: data[47],
    };
    models = models.concat(stockModel);
  }

  // StockModel.insertMany(models, { lean: true });

  // StockModel.bulkSave(models)
  //   .then((res) => console.log(res))
  //   .catch((err) => console.error(`Oops something went wrong:`, err));

  parentPort?.postMessage("done");
});
