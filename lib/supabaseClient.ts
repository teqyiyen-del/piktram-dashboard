import { cookies } from 'next/headers'
import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './supabase-types'

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

export const createRouteClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}
