import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og-card";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const alt = "Ben Everman";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <OgCard eyebrow="beneverman.com" title={SITE_NAME} description={SITE_DESCRIPTION} />,
    size
  );
}
