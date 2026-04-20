import type { APIRoute } from "astro";
import { anonClient } from "../lib/supabase";
export const prerender = false;
export const GET: APIRoute = async () => {
  const SITE = (import.meta.env.PUBLIC_SITE_URL ?? "https://harmony-threads-k7x2.vercel.app").replace(/\/$/, "");
  const sb = anonClient();
  const { data: pages } = sb ? await sb.from("pages").select("slug,title,body_html").not("published_at","is",null) : { data: [] };
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const staticContent = [
    { title: "Harmony Threads", body: "Rock music culture, worn and read. Graphic tees, digital books, and artefacts for the music-obsessed. Founded 2026." },
    { title: "The Band Graphic T-Shirt", body: "Vintage rock music graphic tee. Available in green, gray, and red. Sizes Small, Medium, Large, XL. $19.99. Compare at $24.99." },
    { title: "The History of Rock Music", body: "Definitive digital guide to rock music history. Available as Kindle ($9.99), PDF ($14.99), Audio ($21.99)." },
  ];
  const dbContent = (pages ?? []).map((p: any) => ({ title: p.title, body: stripHtml(p.body_html ?? "") }));
  const all = [...staticContent, ...dbContent];
  return new Response(all.map(p => `# ${p.title}\n\n${p.body}\n\n---\n`).join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
