export type Styles = {
  progress: string;
  progressBar: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
