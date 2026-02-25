import { RouterProvider } from 'react-router-dom'
import { appRouter } from '@/app/router/routes'

export function AppRouterProvider() {
  return <RouterProvider router={appRouter} />
}
