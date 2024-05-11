//import dts from "vite-plugin-dts";

export default {
    // plugins: [
    //     dts({ rollupTypes: true }), 
    // ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'chaincraft-validator',
            fileName: (format) => `${format}/chaincraft-validator.js`
        },
        rollupOptions: {
        }
    },
    optimizeDeps: {
    }
}