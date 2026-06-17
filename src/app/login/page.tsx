"use client";

import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import LoginBackground from "@/components/LoginBackground";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <LoginBackground />
      <Suspense fallback={<div className="text-white">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
