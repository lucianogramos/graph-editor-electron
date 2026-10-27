const esbuild = require('esbuild');

async function build() {
    await esbuild.build({
        entryPoints: ['src/renderer/renderer.ts'],
        bundle: true,
        outdir: 'dist/renderer',
        platform: 'browser',
        sourcemap: true,
        tsconfig: 'tsconfig.renderer.json'
    });
    console.log('Build completed successfully');
}

build().catch(() => process.exit(1));