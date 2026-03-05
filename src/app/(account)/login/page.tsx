import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <LoginForm />
    </main>
  )
}

export const metadata = {
  title: 'Login - DressCave',
  description: 'Login to your DressCave account',
}
