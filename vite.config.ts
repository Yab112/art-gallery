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
    enforce: "pre", // Run before other plugins
    resolveId(id) {
      // Only handle @ alias imports
      if (id.startsWith("@/")) {
        const relativePath = id.replace("@/", "");
        const srcPath = path.resolve(__dirname, "./src");
        const fullPath = path.resolve(srcPath, relativePath);

        // Try to find the file with extensions
        const extensions = [".tsx", ".ts", ".jsx", ".js", ".json"];
        for (const ext of extensions) {
          const filePath = fullPath + ext;
          try {
            if (fs.existsSync(filePath)) {
              // Return the absolute path - normalize it
              return path.normalize(filePath);
            }
          } catch (e) {
            // Continue to next extension
          }
        }

        // Also check for index files in directories
        try {
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            for (const ext of extensions) {
              const indexPath = path.join(fullPath, `index${ext}`);
              if (fs.existsSync(indexPath)) {
                return path.normalize(indexPath);
              }
            }
          }
        } catch (e) {
          // Directory doesn't exist or can't be accessed
        }
      }
      return null; // Let Vite handle other resolutions
    },
    load(id) {
      // If Vite is trying to load a file without extension that doesn't exist,
      // try to find it with extensions
      if (!id.includes("node_modules") && !path.extname(id)) {
        const extensions = [".tsx", ".ts", ".jsx", ".js", ".json"];
        for (const ext of extensions) {
          const filePath = id + ext;
          try {
            if (fs.existsSync(filePath)) {
              return fs.readFileSync(filePath, "utf-8");
            }
          } catch (e) {
            // Continue
          }
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [fixAliasExtensions(), react()],
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
