import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <RegisterForm />
    </main>
  )
}

export const metadata = {
  title: 'Register - DressCave',
  description: 'Create your DressCave account',
}
