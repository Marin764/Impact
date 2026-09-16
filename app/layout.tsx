import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "首尔 Citywalk 夜景计划｜旅行地图",
  description: "首尔 4 天 3 晚行程地图：按天查看打卡点、路线、交通建议与出国准备清单。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
