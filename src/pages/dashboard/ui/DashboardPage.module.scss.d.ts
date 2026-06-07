export type Styles = {
  analysisInfoCard: string;
  analysisInfoDescription: string;
  analysisInfoHeader: string;
  analysisInfoTitle: string;
  analysisStep: string;
  analysisStepDescription: string;
  analysisStepDetails: string;
  analysisStepDetailsItem: string;
  analysisStepDetailsList: string;
  analysisStepDetailsTitle: string;
  analysisStepNumber: string;
  analysisSteps: string;
  analysisStepText: string;
  analysisStepTitle: string;
  dashboardPage: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
