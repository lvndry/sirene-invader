import { parentPort } from "worker_threads";

import { IStock } from "./stock.interface";

parentPort?.on("message", (lines: string[]) => {
  const models: IStock[] = lines.map((line) => {
    const data = line.split(",");
    const stock = {
      siren: data[0] || undefined,
      nic: data[1] || undefined,
      siret: data[2] || undefined,
      statutDiffusionEtablissement: data[3] || undefined,
      dateCreationEtablissement: data[4] || undefined,
      trancheEffectifsEtablissement: data[5] || undefined,
      anneeEffectifsEtablissement: data[6] || undefined,
      activitePrincipaleRegistreMetiersEtablissement: data[7] || undefined,
      dateDernierTraitementEtablissement: data[8] || undefined,
      etablissementSiege: data[9] || undefined,
      nombrePeriodesEtablissement: data[10] || undefined,
      complementAdresseEtablissement: data[11] || undefined,
      numeroVoieEtablissement: data[12] || undefined,
      indiceRepetitionEtablissement: data[13] || undefined,
      typeVoieEtablissement: data[14] || undefined,
      libelleVoieEtablissement: data[15] || undefined,
      codePostalEtablissement: data[16] || undefined,
      libelleCommuneEtablissement: data[17] || undefined,
      libelleCommuneEtrangerEtablissement: data[18] || undefined,
      distributionSpecialeEtablissement: data[19] || undefined,
      codeCommuneEtablissement: data[20] || undefined,
      codeCedexEtablissement: data[21] || undefined,
      libelleCedexEtablissement: data[22] || undefined,
      codePaysEtrangerEtablissement: data[23] || undefined,
      libellePaysEtrangerEtablissement: data[24] || undefined,
      complementAdresse2Etablissement: data[25] || undefined,
      numeroVoie2Etablissement: data[26] || undefined,
      indiceRepetition2Etablissement: data[27] || undefined,
      typeVoie2Etablissement: data[28] || undefined,
      libelleVoie2Etablissement: data[29] || undefined,
      codePostal2Etablissement: data[30] || undefined,
      libelleCommune2Etablissement: data[31] || undefined,
      libelleCommuneEtranger2Etablissement: data[32] || undefined,
      distributionSpeciale2Etablissement: data[33] || undefined,
      codeCommune2Etablissement: data[34] || undefined,
      codeCedex2Etablissement: data[35] || undefined,
      libelleCedex2Etablissement: data[36] || undefined,
      codePaysEtranger2Etablissement: data[37] || undefined,
      libellePaysEtranger2Etablissement: data[38] || undefined,
      dateDebut: data[39] || undefined,
      etatAdministratifEtablissement: data[40] || undefined,
      enseigne1Etablissement: data[41] || undefined,
      enseigne2Etablissement: data[42] || undefined,
      enseigne3Etablissement: data[43] || undefined,
      denominationUsuelleEtablissement: data[44] || undefined,
      activitePrincipaleEtablissement: data[45] || undefined,
      nomenclatureActivitePrincipaleEtablissement: data[46] || undefined,
      caractereEmployeurEtablissement: data[47] || undefined,
    };

    return Object.fromEntries(
      Object.entries(stock).filter(([, value]) => value !== undefined)
    );
  });

  parentPort?.postMessage(models);
});
