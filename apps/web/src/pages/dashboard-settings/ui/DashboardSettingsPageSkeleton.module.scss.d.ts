export type Styles = {
  blockDescriptionLines: string;
  blockIconLine: string;
  blockText: string;
  checkboxLine: string;
  checkboxPreview: string;
  checkboxText: string;
  ghostActionLine: string;
  githubDescriptionLine: string;
  githubTitleLine: string;
  headerDescriptionLine: string;
  headerEyebrowLine: string;
  headerTitleLine: string;
  helpButtonLine: string;
  historyHintLine: string;
  historyLabelLine: string;
  inputControlLine: string;
  inputHintLine: string;
  inputIconLine: string;
  inputLabelLine: string;
  metricRow: string;
  metricsDescriptionLine: string;
  metricsTitleLine: string;
  preferencesDescriptionLine: string;
  preferencesTitleLine: string;
  primaryActionLine: string;
  sectionDescriptionLines: string;
  sectionHeaderMainPreview: string;
  sectionHeaderText: string;
  sectionIconLine: string;
  status: string;
  textInputPreview: string;
  tokenStatusDescriptionLine: string;
  tokenStatusDescriptionLines: string;
  tokenStatusIconLine: string;
  tokenStatusTitleLine: string;
  visualRoot: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
