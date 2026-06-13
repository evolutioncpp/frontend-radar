export type Styles = {
  backdrop: string;
  body: string;
  closeButton: string;
  description: string;
  footer: string;
  header: string;
  heading: string;
  modal: string;
  modal_lg: string;
  modal_md: string;
  modal_sm: string;
  overlay: string;
  title: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
