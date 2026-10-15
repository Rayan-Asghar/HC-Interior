import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const page = (f) => resolve(import.meta.dirname, f)
export default defineConfig({
  build: {
    rollupOptions: {
      input: { main: page('index.html'), collections: page('collections.html'), products: page('products.html'), about: page('about.html'), contact: page('contact.html') },
    },
  },
})
