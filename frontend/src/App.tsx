import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { router } from './app/router';
import { PwaPrompts } from './components/pwa/PwaPrompts';

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <PwaPrompts />
    </Providers>
  );
}
