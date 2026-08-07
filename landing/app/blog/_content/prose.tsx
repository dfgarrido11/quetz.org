import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Server-rendered prose primitives for the blog.
 * No client hooks, no framer-motion: the article body must be readable
 * without JavaScript.
 */

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 mb-4 scroll-mt-28 text-2xl font-bold leading-snug text-quetz-green sm:text-3xl"
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 mb-3 text-lg font-bold leading-snug text-gray-900 sm:text-xl">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-5 text-[17px] leading-8 text-gray-700">{children}</p>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mb-8 text-lg leading-8 font-medium text-gray-800 sm:text-xl sm:leading-9">
      {children}
    </p>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mb-6 space-y-3 pl-5 text-[17px] leading-8 text-gray-700 marker:text-quetz-green list-disc">
      {children}
    </ul>
  );
}

export function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="mb-6 space-y-3 pl-5 text-[17px] leading-8 text-gray-700 marker:font-bold marker:text-quetz-green list-decimal">
      {children}
    </ol>
  );
}

export function LI({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="my-8 rounded-2xl border border-quetz-green/20 bg-quetz-cream p-6 text-[17px] leading-8 text-gray-800">
      {children}
    </aside>
  );
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold text-quetz-green underline decoration-quetz-green/40 underline-offset-4 transition-colors hover:decoration-quetz-green"
    >
      {children}
    </Link>
  );
}
