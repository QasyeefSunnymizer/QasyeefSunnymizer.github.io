// ─── Edit this file to update the site. Everything empty stays hidden. ───

/** The "right now" strip under the intro. Leave a field "" to hide it. */
export const NOW = {
  reading: "",
  eating: "",
  building: "",
};

/** Your bookshelf. `take` is an optional one-liner, shown when filled. Example:
 *  { title: "Blood Meridian", author: "Cormac McCarthy", take: "Brutal. Beautiful. Both." }
 */
export const BOOKS: { title: string; author: string; take?: string }[] = [
  { title: "Dungeon Crawler Carl", author: "Matt Dinniman" },
  { title: "Red Rising", author: "Pierce Brown" },
  { title: "The Book of the New Sun", author: "Gene Wolfe" },
  { title: "Malazan Book of the Fallen", author: "Steven Erikson" },
  { title: "Reverend Insanity", author: "Gu Zhen Ren" },
  { title: "The Dresden Files", author: "Jim Butcher" },
  { title: "Fablehaven and Dragonwatch", author: "Brandon Mull" },
  { title: "Blood Meridian", author: "Cormac McCarthy" },
  { title: "Dexter", author: "Jeff Lindsay" },
  { title: "Ender Quintet", author: "Orson Scott Card" },
  { title: "Foundation", author: "Isaac Asimov" },
  { title: "Jurassic Park, The Lost World, Sphere", author: "Michael Crichton" },
  { title: "Spiral and Birthday", author: "Koji Suzuki" },
  { title: "Mushoku Tensei", author: "Rifujin na Magonote" },
  { title: "A Certain Magical Index", author: "Kazuma Kamachi" },
  { title: "God of Fishing", author: "Pig That Can Howl Like a Wolf" },
  { title: "Coiling Dragon", author: "Welyjesch" },
  { title: "Shang Shu", author: "Confucius" },
  { title: "The Classic of Mountains and Seas", author: "Anne Birrell (trans.)" },
  { title: "A Chinese Bestiary", author: "Richard E. Strassberg" },
];

/** Hand-picked posts for the reel (Instagram, X, Substack...). Example:
 *  { platform: "Instagram", title: "Cheese pull, Chaska #7", href: "https://www.instagram.com/p/XXXX/", img: "/reel/cheese.jpg" }
 *  Put images in /public/reel/. `img` is optional. YouTube videos are added automatically.
 */
export const REEL: { platform: string; title: string; href: string; img?: string }[] = [];
