// ─── Edit this file to update the site. Everything empty stays hidden. ───

/** The "right now" strip under the intro. Leave a field "" to hide it. */
export const NOW = {
  reading: "",
  eating: "",
  building: "",
};

/** Your bookshelf. Add one object per book. Example:
 *  { title: "The Name of the Wind", author: "Patrick Rothfuss", take: "Magic school but the prose slaps." }
 */
export const BOOKS: { title: string; author: string; take: string }[] = [];

/** Hand-picked posts for the reel (Instagram, X, Substack...). Example:
 *  { platform: "Instagram", title: "Cheese pull, Chaska #7", href: "https://www.instagram.com/p/XXXX/", img: "/reel/cheese.jpg" }
 *  Put images in /public/reel/. `img` is optional. YouTube videos are added automatically.
 */
export const REEL: { platform: string; title: string; href: string; img?: string }[] = [];
