import { model, Schema } from "mongoose";

export interface IStock {
  siren?: string;
  nic?: string;
  siret?: string;
  statutDiffusionEtablissement?: string;
  dateCreationEtablissement?: string;
  trancheEffectifsEtablissement?: string;
  anneeEffectifsEtablissement?: string;
  activitePrincipaleRegistreMetiersEtablissement?: string;
  dateDernierTraitementEtablissement?: string;
  etablissementSiege?: string;
  nombrePeriodesEtablissement?: string;
  complementAdresseEtablissement?: string;
  numeroVoieEtablissement?: string;
  indiceRepetitionEtablissement?: string;
  typeVoieEtablissement?: string;
  libelleVoieEtablissement?: string;
  codePostalEtablissement?: string;
  libelleCommuneEtablissement?: string;
  libelleCommuneEtrangerEtablissement?: string;
  distributionSpecialeEtablissement?: string;
  codeCommuneEtablissement?: string;
  codeCedexEtablissement?: string;
  libelleCedexEtablissement?: string;
  codePaysEtrangerEtablissement?: string;
  libellePaysEtrangerEtablissement?: string;
  complementAdresse2Etablissement?: string;
  numeroVoie2Etablissement?: string;
  indiceRepetition2Etablissement?: string;
  typeVoie2Etablissement?: string;
  libelleVoie2Etablissement?: string;
  codePostal2Etablissement?: string;
  libelleCommune2Etablissement?: string;
  libelleCommuneEtranger2Etablissement?: string;
  distributionSpeciale2Etablissement?: string;
  codeCommune2Etablissement?: string;
  codeCedex2Etablissement?: string;
  libelleCedex2Etablissement?: string;
  codePaysEtranger2Etablissement?: string;
  libellePaysEtranger2Etablissement?: string;
  dateDebut?: string;
  etatAdministratifEtablissement?: string;
  enseigne1Etablissement?: string;
  enseigne2Etablissement?: string;
  enseigne3Etablissement?: string;
  denominationUsuelleEtablissement?: string;
  activitePrincipaleEtablissement?: string;
  nomenclatureActivitePrincipaleEtablissement?: string;
  caractereEmployeurEtablissement?: string;
}

const StockSchema = new Schema<IStock>({
  siren: { type: String, required: false, trim: true },
  nic: { type: String, required: false, trim: true },
  siret: { type: String, required: false, trim: true },
  statutDiffusionEtablissement: { type: String, required: false, trim: true },
  dateCreationEtablissement: { type: String, required: false, trim: true },
  trancheEffectifsEtablissement: { type: String, required: false, trim: true },
  anneeEffectifsEtablissement: { type: String, required: false, trim: true },
  activitePrincipaleRegistreMetiersEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
  dateDernierTraitementEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
  etablissementSiege: { type: String, required: false, trim: true },
  nombrePeriodesEtablissement: { type: String, required: false, trim: true },
  complementAdresseEtablissement: { type: String, required: false, trim: true },
  numeroVoieEtablissement: { type: String, required: false, trim: true },
  indiceRepetitionEtablissement: { type: String, required: false, trim: true },
  typeVoieEtablissement: { type: String, required: false, trim: true },
  libelleVoieEtablissement: { type: String, required: false, trim: true },
  codePostalEtablissement: { type: String, required: false, trim: true },
  libelleCommuneEtablissement: { type: String, required: false, trim: true },
  libelleCommuneEtrangerEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
  distributionSpecialeEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
  codeCommuneEtablissement: { type: String, required: false, trim: true },
  codeCedexEtablissement: { type: String, required: false, trim: true },
  libelleCedexEtablissement: { type: String, required: false, trim: true },
  codePaysEtrangerEtablissement: { type: String, required: false, trim: true },
  libellePaysEtrangerEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
  complementAdresse2Etablissement: {
    type: String,
    required: false,
    trim: true,
  },
  numeroVoie2Etablissement: { type: String, required: false, trim: true },
  indiceRepetition2Etablissement: { type: String, required: false, trim: true },
  typeVoie2Etablissement: { type: String, required: false, trim: true },
  libelleVoie2Etablissement: { type: String, required: false, trim: true },
  codePostal2Etablissement: { type: String, required: false, trim: true },
  libelleCommune2Etablissement: { type: String, required: false, trim: true },
  libelleCommuneEtranger2Etablissement: {
    type: String,
    required: false,
    trim: true,
  },
  distributionSpeciale2Etablissement: {
    type: String,
    required: false,
    trim: true,
  },
  codeCommune2Etablissement: { type: String, required: false, trim: true },
  codeCedex2Etablissement: { type: String, required: false, trim: true },
  libelleCedex2Etablissement: { type: String, required: false, trim: true },
  codePaysEtranger2Etablissement: { type: String, required: false, trim: true },
  libellePaysEtranger2Etablissement: {
    type: String,
    required: false,
    trim: true,
  },
  dateDebut: { type: String, required: false, trim: true },
  etatAdministratifEtablissement: { type: String, required: false, trim: true },
  enseigne1Etablissement: { type: String, required: false, trim: true },
  enseigne2Etablissement: { type: String, required: false, trim: true },
  enseigne3Etablissement: { type: String, required: false, trim: true },
  denominationUsuelleEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
  activitePrincipaleEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
  nomenclatureActivitePrincipaleEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
  caractereEmployeurEtablissement: {
    type: String,
    required: false,
    trim: true,
  },
});

export const StockModel = model("Stock", StockSchema);
