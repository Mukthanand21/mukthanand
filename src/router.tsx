import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Status } from './sections/Status';
import { Services } from './sections/Services';
import { Changelog } from './sections/Changelog';
import { Stack } from './sections/Stack';
import { Contact } from './sections/Contact';
import { NotFound } from './sections/NotFound';

// Single-page experience: sections render in order under the shared Layout.
// Routes also allow deep-linking to each section label.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Status /> },
      { path: 'status', element: <Status /> },
      { path: 'services', element: <Services /> },
      { path: 'changelog', element: <Changelog /> },
      { path: 'stack', element: <Stack /> },
      { path: 'contact', element: <Contact /> },
      { path: '404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
