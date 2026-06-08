import { AppProviders } from './providers/app-providers';
import { AppRouterProvider } from './providers/router-provider';

export function App() {
  return (
    <AppProviders>
      <AppRouterProvider />
    </AppProviders>
  );
}
