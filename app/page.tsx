'use client'

//rediriger vers la page /home

export default function Page() {
  if (typeof window !== 'undefined') {
    window.location.href = '/home'
  }

  return null
}