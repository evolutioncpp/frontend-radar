export type Styles = {
  badge: string;
  badge_danger: string;
  badge_default: string;
  badge_info: string;
  badge_success: string;
  badge_warning: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
