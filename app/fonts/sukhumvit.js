import localFont from "next/font/local";

export const sukhumvit = localFont({
  src: [
    {
      path: "./SukhumvitTadmai-UltraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./SukhumvitTadmai-Text.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./SukhumvitTadmai-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./SukhumvitTadmai-ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sukhumvit",
  display: "swap",
});
