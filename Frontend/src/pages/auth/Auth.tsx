import { DynamicFormContent } from '@/components/auth';
import AuthLayout from '@/components/layout/AuthLayout';

/**
 * Authentication page component
 * Renders the authentication layout with dynamic form handling
 */
export function AuthPage() {
  return (
    <AuthLayout>
      <DynamicFormContent />
    </AuthLayout>
  );
}

export default AuthPage;
