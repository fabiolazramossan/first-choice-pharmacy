"use client";

import type { ReactNode } from "react";

/**
 * Wraps form controls so changing them submits the enclosing GET form right
 * away. Without JavaScript the form's own submit button still works.
 */
export default function AutoSubmit({ children }: { children: ReactNode }) {
  return (
    <div
      className="contents"
      onChange={(event) => {
        const form = (event.target as HTMLElement).closest("form");
        form?.requestSubmit();
      }}
    >
      {children}
    </div>
  );
}
