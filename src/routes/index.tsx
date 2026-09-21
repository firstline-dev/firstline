import { createFileRoute } from "@tanstack/react-router";

import { FirstLineApp } from "@/components/firstline/FirstLineApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FirstLine — save your context, resume with one line" },
      {
        name: "description",
        content:
          "Save what you were working on before you close the tab, then get one first line to restart. Built for developers with ADHD. No accounts, no servers.",
      },
      { name: "google", content: "notranslate" },
      { property: "og:title", content: "FirstLine — resume your code with one line" },
      {
        property: "og:description",
        content:
          "FirstLine is a free-tier, localStorage-only context-saver for developers with ADHD: it captures your context in 15 seconds before you leave, and hands you the first line to write when you return.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  }),
  component: FirstLineApp,
});

