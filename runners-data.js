/* Runner list — edit here to add/change runners.
   max: last gathering it's available for — 0 Sweetheart, 1 Storybook, 2 Once Upon, 3 Ever After
   m: length in meters
   long: 5-meter runners, so Once Upon uses 2 and Ever After 3 (others: 3 and 4)
   soon: a higher max from a date, e.g. when more pieces arrive
   layer: (no longer used on the booking page) */
window.RUNNER_GROUPS = [
  { title: "Sheer & Airy", desc: "Airy, soft and dreamy. Light that filters through.", items: [
    { name: "Sage Green",     fabric: "Tulle", m: 3, hex: "#8FB29C", max: 1, img: "img/runner-green.jpg" },
    { name: "Aquamarine Blue",      fabric: "Tulle", m: 3, hex: "#8DB7DA", max: 1, img: "img/runner-blue.jpg" },
    { name: "Buttercup Yellow", fabric: "Tulle", m: 5, hex: "#F8DF6E", max: 2, long: true, img: "img/runner-buttercup.jpg" },
    { name: "Tangerine Orange",    fabric: "Tulle", m: 3, hex: "#F6A650", max: 1, img: "img/runner-orange.jpg" }
  ]},
  { title: "Soft & Textured", desc: "Textured, romantic and relaxed. Made to drape and pool.", items: [
    { name: "Blush Pink",         fabric: "Cheesecloth", m: 4, hex: "#EFA9C5", max: 3, layer: true, img: "img/runner-pink.jpg" },
    { name: "Pearl White",        fabric: "Cheesecloth", m: 4, hex: "#F7F5F0", max: 3, layer: true, img: "img/runner-white.jpg" },
    { name: "Marigold Yellow",     fabric: "Cheesecloth", m: 4, hex: "#F2D22E", max: 1, img: "img/runner-marigold.jpg" },
    { name: "Mocha Brown", fabric: "Cheesecloth", m: 4, hex: "#4A2618", max: 1, img: "img/runner-coffee-brown.jpg" },
    { name: "Rust Brown",   fabric: "Cheesecloth", m: 4, hex: "#6B2014", max: 1, img: "img/runner-rust-brown.jpg" },
    { name: "Cherry Red",   fabric: "Cheesecloth", m: 3.4, hex: "#B3121F", max: 1, soon: { from: "2026-11-01", max: 2 }, img: "img/runner-red-cheesecloth.jpg" },
    { name: "Midnight Black", fabric: "Cheesecloth", m: 3.4, hex: "#111111", max: 1, soon: { from: "2026-11-01", max: 2 }, img: "img/runner-black-cheesecloth.jpg" },
    { name: "Lilac Purple",       fabric: "Cheesecloth", m: 3, hex: "#B497C6", max: 1, img: "img/runner-purple.jpg" }
  ]},
  { title: "Bold & Dramatic", desc: "Deep, rich color with more body. Made for evenings that want a little drama.", items: [
    { name: "Ruby Red", fabric: "Organza", m: 5, hex: "#960A14", max: 2, long: true, img: "img/runner-red-organza.jpg" },
    { name: "Onyx Black", fabric: "Katrina", m: 5, hex: "#000000", max: 2, long: true, img: "img/runner-black-katrina.jpg" }
  ]}
];
