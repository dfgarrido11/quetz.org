import type { ComponentType } from "react";
import BaumAdoptierenDeutschland from "./baum-adoptieren-deutschland";
import BaumVerschenken from "./baum-verschenken";
import GedenkbaumPflanzen from "./gedenkbaum-pflanzen";
import CsrBaumpflanzungUnternehmen from "./csr-baumpflanzung-unternehmen";

/**
 * Slug -> server-rendered article body.
 * Every component here is a plain server component: no hooks, no animation
 * wrappers, so the prose is present in the initial HTML.
 */
export const articleBodies: Record<string, ComponentType> = {
  "baum-adoptieren-deutschland": BaumAdoptierenDeutschland,
  "baum-verschenken": BaumVerschenken,
  "gedenkbaum-pflanzen": GedenkbaumPflanzen,
  "csr-baumpflanzung-unternehmen": CsrBaumpflanzungUnternehmen,
};

export function getArticleBody(slug: string): ComponentType | undefined {
  return articleBodies[slug];
}
