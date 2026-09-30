const fs = require('fs');
const path = require('path');

const iosDir = path.resolve(__dirname, '../ios');
const tempAppDir = path.join(iosDir, 'TempApp');
const targetAppDir = path.join(iosDir, 'OfflineInterviewApp');

// 1. Copy files from ios/TempApp to ios/OfflineInterviewApp if TempApp exists
if (fs.existsSync(tempAppDir)) {
  fs.readdirSync(tempAppDir).forEach((file) => {
    const srcFile = path.join(tempAppDir, file);
    const destFile = path.join(targetAppDir, file);
    if (!fs.existsSync(destFile)) {
      if (fs.statSync(srcFile).isDirectory()) {
        fs.cpSync(srcFile, destFile, { recursive: true });
      } else {
        fs.copyFileSync(srcFile, destFile);
      }
    }
  });
  fs.rmSync(tempAppDir, { recursive: true, force: true });
}

// 2. Rename TempApp.xcodeproj -> OfflineInterviewApp.xcodeproj
const tempProj = path.join(iosDir, 'TempApp.xcodeproj');
const targetProj = path.join(iosDir, 'OfflineInterviewApp.xcodeproj');
if (fs.existsSync(tempProj)) {
  fs.renameSync(tempProj, targetProj);
}

// 3. Rename TempAppTests -> OfflineInterviewAppTests
const tempTests = path.join(iosDir, 'TempAppTests');
const targetTests = path.join(iosDir, 'OfflineInterviewAppTests');
if (fs.existsSync(tempTests)) {
  fs.renameSync(tempTests, targetTests);
}

// 4. Rename internal scheme files
const schemeDir = path.join(targetProj, 'xcshareddata/xcschemes');
if (fs.existsSync(schemeDir)) {
  const oldScheme = path.join(schemeDir, 'TempApp.xcscheme');
  const newScheme = path.join(schemeDir, 'OfflineInterviewApp.xcscheme');
  if (fs.existsSync(oldScheme)) {
    fs.renameSync(oldScheme, newScheme);
  }
}

// 5. Replace text in files
function replaceInFiles(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      replaceInFiles(fullPath);
    } else if (
      item.endsWith('.pbxproj') ||
      item.endsWith('.xcscheme') ||
      item.endsWith('.plist') ||
      item.endsWith('.mm') ||
      item.endsWith('.m') ||
      item.endsWith('.h') ||
      item === 'Podfile' ||
      item.endsWith('.xcconfig')
    ) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('TempApp')) {
        content = content.replace(/TempApp/g, 'OfflineInterviewApp');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

replaceInFiles(iosDir);

// 6. Clean up TempApp folder in root if present
const rootTemp = path.resolve(__dirname, '../TempApp');
if (fs.existsSync(rootTemp)) {
  fs.rmSync(rootTemp, { recursive: true, force: true });
}

console.log('Successfully configured ios/ for OfflineInterviewApp!');
