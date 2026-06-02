export const AppRoutes = {
  HOME: '/',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];
