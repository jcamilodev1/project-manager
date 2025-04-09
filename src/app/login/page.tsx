'use client'

import { Suspense } from "react"
import LoginPage from "./loginPage"

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginPage />
    </Suspense>
  )
}