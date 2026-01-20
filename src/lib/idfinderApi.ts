const BASE = import.meta.env.VITE_IDFINDER_API_BASE;

if (!BASE) {
  throw new Error("VITE_IDFINDER_API_BASE is not defined");
}
