export type Styles = {
  card: string;
  card_flat: string;
  card_outlined: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
