import AppLayout from './components/AppLayout';
import './styles/globals.css';

/**
 * Root App component
 * Entry point of the application
 *
 * Responsibilities:
 * - Import global styles
 * - Render AppLayout wrapper
 *
 * SOLID Principles:
 * - Single Responsibility: Only serves as entry point
 * - Dependency Inversion: Delegates all logic to AppLayout
 */
export default function App() {
  return <AppLayout />;
}