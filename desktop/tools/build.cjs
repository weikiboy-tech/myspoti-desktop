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
const brand = path.join(root, '..', 'docs', 'brand');
const icon = fs.readFileSync(path.join(brand, 'myspoti-logo.svg'), 'utf8');
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({ name: 'Myspoti', icon, 'active-icon': icon, subfiles_extension: ['myspoti-runtime.js'] }, null, 2));
// Windows ICO supports a PNG image payload (0 dimensions denote 256 pixels).
const png = fs.readFileSync(path.join(brand, 'myspoti-logo-256.png'));
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(out, 'myspoti.ico'), Buffer.concat([ico, png]));
for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) fs.copyFileSync(path.join(root, '..', name), path.join(out, name));
console.log('Spicetify-Paket erstellt: ' + out);
