export type Styles = {
  description: string;
  eyebrow: string;
  header: string;
  headingGroup: string;
  metadata: string;
  metadataItem: string;
  panel: string;
  repository: string;
  repositoryName: string;
  status: string;
  step: string;
  step_active: string;
  step_complete: string;
  step_pending: string;
  stepMarker: string;
  steps: string;
  stepText: string;
  summary: string;
  summaryLabel: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
