import { render } from "@react-email/components";
import React from "react";
import { WelcomeTreeAdoption, WelcomeTreeAdoptionProps } from "./welcome-tree-adoption";

/**
 * Renders the welcome tree adoption email to an HTML string.
 * Drop-in replacement for the old buildWelcomeEmail() inline function.
 */
export async function renderWelcomeEmail(props: WelcomeTreeAdoptionProps): Promise<string> {
  const element = React.createElement(WelcomeTreeAdoption, props);
  return render(element);
}
