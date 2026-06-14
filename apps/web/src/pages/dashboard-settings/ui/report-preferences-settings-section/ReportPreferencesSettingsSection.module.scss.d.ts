export type Styles = {
  block: string;
  blockDescription: string;
  blockHeader: string;
  blockIcon: string;
  blockTitle: string;
  metricCheckbox: string;
  metricsList: string;
  section: string;
  sectionDescription: string;
  sectionHeader: string;
  sectionIcon: string;
  sectionTitle: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
