export type Styles = {
  shimmer: string;
  skeleton: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
