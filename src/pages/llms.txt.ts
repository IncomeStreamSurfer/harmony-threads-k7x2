import type { APIRoute } from "astro";
import { anonClient } from "../lib/supabase";
export const prerender = false;
export const GET: APIRoute = async () => {
  const SITE = (import.meta.env.PUBLIC_SITE_URL ?? "https://harmony-threads-k7x2.vercel.app").replace(/\/$/, "");
  const sb = anonClient();
  const pages = sb ? (await sb.from("pages").select("slug,title,meta_description").not("published_at","is",null)).data ?? [] : [];
  const articles = sb ? (await sb.from("content").select("slug,title,excerpt").not("published_at","is",null).order("published_at",{ascending:false}).limit(30)).data ?? [] : [];
  const lines = ["# Harmony Threads","","> Rock music culture, worn and read. Graphic tees, digital books, and artefacts for the music-obsessed.","","## Key pages","",
    `- [Home](${SITE}/): Rock music apparel and digital downloads`,
    `- [Shop](${SITE}/shop): Full product catalogue`,
    `- [Apparel](${SITE}/collections/apparel): Graphic t-shirts`,
    `- [Digital Downloads](${SITE}/collections/digital): eBooks and audio`,
    `- [Vintage Style](${SITE}/tags/vintage): Vintage-inspired rock music apparel`,
    `- [About](${SITE}/about): Our story`,
    `- [Contact](${SITE}/contact): Get in touch`,
    `- [Journal](${SITE}/blog): Rock music writing`,
  ];
  for (const p of pages) lines.push(`- [${p.title}](${p.slug==="home"?`${SITE}/`:`${SITE}/${p.slug}`}): ${p.meta_description??""}`);
  if (articles.length>0) { lines.push("","## Latest articles",""); for (const a of articles) lines.push(`- [${a.title}](${SITE}/blog/${a.slug}): ${a.excerpt??""}`);
  }
  lines.push("","## Products","",
    `- [The Band Graphic T-Shirt](${SITE}/products/physical-product-the-band-t-shirt): $19.99`,
    `- [The History of Rock Music](${SITE}/products/digital-product-the-history-of-rock-music): from $9.99`,
    `- [Example Perfume](${SITE}/products/example-perfume): $74.99`);
  return new Response(lines.join("\n"),{headers:{"Content-Type":"text/markdown; charset=utf-8"}});
};
