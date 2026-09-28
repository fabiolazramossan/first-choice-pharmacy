// Shared by the server layout and the client ThemeProvider (kept out of the
// "use client" module so the server receives the actual string).

export const THEME_STORAGE_KEY = "fcp-theme";

/**
 * Runs inline in <head> before first paint so the page never flashes the
 * wrong theme. (Previously the whole site was hidden until React hydrated,
 * which delayed every page's first paint and left it blank without JS.)
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;
