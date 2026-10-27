const esbuild = require('esbuild');

async function build() {
    await esbuild.build({
        entryPoints: ['src/preload/preload.ts'],
        bundle: true,
        outfile: 'dist/preload/preload.js',
        platform: 'node',
        target: 'node22',
        external: ['electron'],
        sourcemap: true,
        tsconfig: 'tsconfig.preload.json'
    });
    console.log('src/preload/preload.ts: Build completed successfully\n');

    await esbuild.build({
        entryPoints: ['src/renderer/renderer.ts'],
        bundle: true,
        outdir: 'dist/renderer',
        platform: 'browser',
        sourcemap: true,
        tsconfig: 'tsconfig.renderer.json'
    });
    console.log('src/renderer/renderer.ts: Build completed successfully');
}

build().catch(() => process.exit(1));