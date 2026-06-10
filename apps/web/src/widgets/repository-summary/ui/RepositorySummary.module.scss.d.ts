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
  projectDetection: string;
  projectDetectionContent: string;
  projectDetectionMetaIcon: string;
  projectDetectionMetaItem: string;
  projectDetectionMetaList: string;
  projectDetectionSignal: string;
  projectDetectionSignalContent: string;
  projectDetectionSignalDescription: string;
  projectDetectionSignalList: string;
  projectDetectionSignalMarker: string;
  projectDetectionSignalMarker_found: string;
  projectDetectionSignalMarker_missing: string;
  projectDetectionSignalMarker_warning: string;
  projectDetectionSignalSource: string;
  projectDetectionSignalTitle: string;
  projectDetectionSummary: string;
  projectDetectionSummaryIcon: string;
  projectDetectionSummaryMeta: string;
  repositoryLink: string;
  repositorySummary: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
