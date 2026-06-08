export type Styles = {
  content: string;
  contentBottom: string;
  contentLeft: string;
  contentRight: string;
  contentTop: string;
  tooltip: string;
  tooltipFullWidth: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
