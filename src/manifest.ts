import type { Manifest } from 'webextension-polyfill';
import pkg from '../package.json';

const manifest: Manifest.WebExtensionManifest = {
  manifest_version: 3,
  name: process.env.__DEV__ === 'true' ? `Test - __MSG_extensionName__` : "__MSG_extensionName__",
  version: pkg.version,
  description: "__MSG_extensionDescription__",
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'icon-34.png',
  },
  icons: {
    '128': 'icon-128.png',
  },
  permissions: [
    "storage",
    "tabs"
  ],
  content_scripts: [{
    matches: ["*://youtube.com/*", "*://www.youtube.com/*"],
    js: ['src/pages/content/index.js'],
    run_at: "document_end",
  }],
  web_accessible_resources: [{
    resources: [
      "icons/*",
      "icon-128.png"
    ],
    matches: [
      "*://*.youtube.com/*"
    ]
  }],
  default_locale: "en",
};

export default manifest;
