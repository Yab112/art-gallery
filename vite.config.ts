import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin to fix extension resolution for path aliases in Vite 6
function fixAliasExtensions(): Plugin {
  return {
    name: "fix-alias-extensions",
    resolveId(id) {
      // Only handle @ alias imports
      if (id.startsWith("@/")) {
        const relativePath = id.replace("@/", "");
        const fullPath = path.resolve(__dirname, "./src", relativePath);

        // Try to find the file with extensions
        const extensions = [".tsx", ".ts", ".jsx", ".js"];
        for (const ext of extensions) {
          const filePath = fullPath + ext;
          if (fs.existsSync(filePath)) {
            return filePath;
          }
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), fixAliasExtensions()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
  },
  define: {
    global: {
      basename: "",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
