"use client";

import { FormEvent, useState } from "react";
import { useLogin } from "@/features/auth/use-login";
import { getApiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const [internalId, setInternalId] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loginMutation.mutate({
      internalId: internalId.trim(),
      password,
    });
  }

  const errorMessage = loginMutation.error
    ? getApiErrorMessage(loginMutation.error)
    : null;

return (
  <main
    className="flex min-h-screen items-center justify-center px-4"
    style={{ background: "var(--color-background)" }}
  >
    <section className="premium-card w-full max-w-md p-8">
      <div className="mb-8">
        <p
          className="text-sm font-black uppercase tracking-[0.18em]"
          style={{ color: "var(--color-secondary)" }}
        >
          Restaurant Management System
        </p>

        <h1
          className="mt-3 text-4xl font-black tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Connexion
        </h1>

        <p className="mt-3 text-sm" style={{ color: "var(--color-muted)" }}>
          Connectez-vous avec votre identifiant interne.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="internalId"
            className="block text-sm font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Identifiant interne
          </label>

          <input
            id="internalId"
            type="text"
            value={internalId}
            onChange={(event) => setInternalId(event.target.value)}
            placeholder="GER-01, SRV-02, CAIS-01"
            className="premium-input mt-2 w-full px-4 py-3"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Mot de passe
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••"
            className="premium-input mt-2 w-full px-4 py-3"
            required
          />
        </div>

        {errorMessage && (
          <div
            className="rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
            }}
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="premium-button-primary w-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </section>
  </main>
);
}