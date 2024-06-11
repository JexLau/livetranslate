import pkg from '../package.json';
export const outputFolderName = process.env.__DEV__ === 'true' ? 'dist' : `LiveTranslate_${pkg.version}`;
