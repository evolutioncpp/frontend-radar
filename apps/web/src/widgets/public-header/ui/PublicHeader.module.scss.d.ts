export type Styles = {
  logo: string;
  navigation: string;
  navigationLink: string;
  publicHeader: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
