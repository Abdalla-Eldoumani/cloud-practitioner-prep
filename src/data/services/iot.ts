import type { ServiceEntry } from "../../lib/types";

// AWS category: Internet of Things. In-scope set: AWS IoT Core. Authored against
// the official in-scope appendix; each entry carries a sourced reference and a
// lastVerified date. Expected ids: see expected-manifest.ts.
export const iot: ServiceEntry[] = [
  {
    id: "aws-iot-core",
    name: "AWS IoT Core",
    shortName: "IoT Core",
    domain: 3,
    category: "Internet of Things",
    purpose:
      "A managed service that lets internet-connected devices connect to the AWS cloud securely and exchange messages with applications and other devices.",
    whenToUse:
      "Reach for it when you have connected devices, such as sensors or equipment, that need to send data to the cloud and receive commands at scale.",
    reference: {
      label: "What is AWS IoT Core?",
      url: "https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html",
    },
    lastVerified: "2026-07-29",
    aliases: [
      "IoT Core",
      "Internet of Things",
      "connected devices",
      "device connectivity",
    ],
    relatedTerms: ["IoT", "devices", "sensors", "connectivity"],
  },
];
