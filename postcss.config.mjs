// Tailwind v4 via its PostCSS plugin. Tailwind is imported only by the lab's
// Coss theme (scoped), so it does not touch the blog's hand-rolled globals.css.
const config = {
  plugins: {
    "@tailwindcss/postcss": {}
  }
};

export default config;
