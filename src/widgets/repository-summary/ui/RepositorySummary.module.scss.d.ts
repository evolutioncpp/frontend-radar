export type Styles = {
  description: string;
  header: string;
  label: string;
  main: string;
  metaIcon: string;
  metaItem: string;
  metaLabel: string;
  metaList: string;
  metaValue: string;
  metaValueCode: string;
  repositoryLink: string;
  repositorySummary: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
