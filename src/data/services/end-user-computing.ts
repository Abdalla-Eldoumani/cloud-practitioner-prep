import type { ServiceEntry } from "../../lib/types";

// AWS category: End User Computing. In-scope set: Amazon AppStream 2.0, Amazon
// WorkSpaces, Amazon WorkSpaces Secure Browser. Authored against the official
// in-scope appendix; each entry carries a sourced reference and a lastVerified
// date. Expected ids: see expected-manifest.ts.
// Naming: the appendix still lists Amazon AppStream 2.0, which AWS now ships as
// Amazon WorkSpaces Applications, so the exam term stays the primary name and
// the current name is carried in purpose, aliases, and the reference label. The
// appendix likewise names WorkSpaces Secure Browser, formerly WorkSpaces Web.
export const endUserComputing: ServiceEntry[] = [
  {
    id: "amazon-appstream-2-0",
    name: "Amazon AppStream 2.0",
    shortName: "AppStream 2.0",
    domain: 3,
    category: "End User Computing",
    purpose:
      "A fully managed application streaming service that delivers desktop applications to users through a web browser. AWS has renamed the service Amazon WorkSpaces Applications; the CLF-C02 exam guide still lists it as Amazon AppStream 2.0.",
    whenToUse:
      "Reach for it when you want users to run a desktop application from a browser, with the application hosted in AWS instead of installed on each device.",
    reference: {
      label: "What Is Amazon WorkSpaces Applications? (formerly Amazon AppStream 2.0)",
      url: "https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "AppStream",
      "AppStream 2.0",
      "Amazon WorkSpaces Applications",
      "WorkSpaces Applications",
      "application streaming",
      "stream applications",
    ],
    relatedTerms: ["application streaming", "desktop apps", "browser", "hosted apps"],
  },
  {
    id: "amazon-workspaces",
    name: "Amazon WorkSpaces",
    shortName: "WorkSpaces",
    domain: 3,
    category: "End User Computing",
    purpose:
      "A fully managed service that provides cloud-based virtual desktops to users on demand.",
    whenToUse:
      "Reach for it when you need to give users a full virtual desktop they can reach from many devices, without buying and maintaining physical computers.",
    reference: {
      label: "What is Amazon WorkSpaces?",
      url: "https://docs.aws.amazon.com/workspaces/latest/adminguide/amazon-workspaces.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "WorkSpaces",
      "virtual desktop",
      "desktop as a service",
      "DaaS",
    ],
    relatedTerms: ["virtual desktop", "DaaS", "cloud desktop", "remote desktop"],
  },
  {
    id: "amazon-workspaces-secure-browser",
    name: "Amazon WorkSpaces Secure Browser",
    shortName: "WorkSpaces Secure Browser",
    domain: 3,
    category: "End User Computing",
    purpose:
      "A managed service that lets users access internal websites and software-as-a-service applications from a secure browser running in AWS.",
    whenToUse:
      "Reach for it when you want users to reach internal or SaaS web applications through a browser without managing the browser fleet or keeping the data on their devices.",
    reference: {
      label: "What is Amazon WorkSpaces Secure Browser?",
      url: "https://docs.aws.amazon.com/workspaces-web/latest/adminguide/what-is-workspaces-secure-browser.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "WorkSpaces Secure Browser",
      "Amazon WorkSpaces Web",
      "WorkSpaces Web",
      "secure browser",
      "managed browser",
      "browser isolation",
    ],
    relatedTerms: ["secure browser", "web access", "SaaS access", "isolation"],
  },
];
