module.exports = {
  port: 3000,
  open: false,
  notify: false,
  ghostMode: false,
  watch: true,
  files: [
    "build/**/*.js",
    "build/**/*.css",
    "style.css",
    "theme.json",
    "functions.php",
    "templates/**/*.html",
    "parts/**/*.html",
    "patterns/**/*.php",
  ],
  reloadDebounce: 500,
  logLevel: "info",
};
