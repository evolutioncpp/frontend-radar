export type Styles = {
  commitIconLine: string;
  compactDateLine: string;
  descriptionLine: string;
  descriptionLines: string;
  disclosureIconLine: string;
  disclosurePreview: string;
  metaIconLine: string;
  repositoryNameLine: string;
  scoreValueLine: string;
  status: string;
  titleLine: string;
  visualRoot: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
