// Supabase users client
// Placeholder - to be implemented in future stories

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export async function getUser(userId: string) {
  // TODO: Implement with Supabase client
  return null;
}

export async function updateUser(userId: string, data: Partial<User>) {
  // TODO: Implement with Supabase client
  return null;
}
