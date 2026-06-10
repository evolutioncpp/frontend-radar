export type Styles = {
  commitTitle: string;
  commitTitleIcon: string;
  commitTitleText: string;
  description: string;
  header: string;
  headerAside: string;
  metaIcon: string;
  metaItem: string;
  metaLabel: string;
  metaList: string;
  metaValue: string;
  metaValueCode: string;
  repositoryLink: string;
  repositorySummary: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
