// SPDX-License-Identifier: GPL-3.0-only
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist', 'myspoti-desktop');
fs.mkdirSync(out, { recursive: true });
const read = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
for (const name of ['core.js', 'app.js', 'background.js']) new vm.Script(read(name), { filename: name });
fs.writeFileSync(path.join(out, 'index.js'), read('core.js') + '\n' + read('app.js'));
fs.writeFileSync(path.join(out, 'myspoti-runtime.js'), read('core.js') + '\n' + read('background.js'));
fs.copyFileSync(path.join(root, 'src', 'style.css'), path.join(out, 'style.css'));
const icon = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M4 5h4l4 8 4-8h4v14h-4v-7l-4 7-4-7v7H4z"/></svg>';
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({ name: 'Myspoti Desktop', icon, 'active-icon': icon, subfiles_extension: ['myspoti-runtime.js'] }, null, 2));
for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) fs.copyFileSync(path.join(root, '..', name), path.join(out, name));
console.log('Spicetify-Paket erstellt: ' + out);
