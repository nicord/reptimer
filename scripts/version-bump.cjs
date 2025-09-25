#!/usr/bin/env node

/**
 * Version Bump Script
 * 
 * This script automatically increments the patch version number in package.json 
 * and updates the corresponding version in src/pwa-assets.ts when source files have changed.
 * 
 * Usage:
 *   node scripts/version-bump.cjs
 *   npm run version-bump
 * 
 * The script:
 * 1. Checks git for changes in source files (src/, public/, config files)
 * 2. If changes are detected, increments the patch version (x.y.z -> x.y.z+1)
 * 3. Updates package.json with the new version
 * 4. Updates the getAppVersion() function in src/pwa-assets.ts
 * 5. Updates the version meta tag and comment in index.html
 * 
 * This ensures that every build with source changes gets a unique version number
 * for proper cache busting and deployment tracking.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function hasSourceChanges() {
  try {
    // Check if there are any changes in source files since last commit
    const result = execSync('git diff --name-only HEAD', { encoding: 'utf8' });
    const changedFiles = result.trim().split('\n').filter(Boolean);
    
    // Check if any changed files are in src/ directory or other relevant files
    const sourceFilePatterns = [
      /^src\//,
      /^public\//,
      /\.tsx?$/,
      /\.css$/,
      /\.json$/,
      /vite\.config\./,
      /tailwind\.config\./,
      /tsconfig\./
    ];
    
    const hasRelevantChanges = changedFiles.some(file => 
      sourceFilePatterns.some(pattern => pattern.test(file))
    );
    
    if (hasRelevantChanges) {
      console.log('📦 Source changes detected:', changedFiles.filter(file => 
        sourceFilePatterns.some(pattern => pattern.test(file))
      ));
      return true;
    }
    
    // Also check if this is the first build (no previous commits)
    try {
      execSync('git rev-parse HEAD', { stdio: 'ignore' });
      return false;
    } catch {
      console.log('📦 No previous commits found, treating as new build');
      return true;
    }
  } catch (error) {
    // If git command fails, assume changes exist to be safe
    console.log('📦 Could not check git status, assuming changes exist');
    return true;
  }
}

function incrementVersion(version) {
  const parts = version.split('.');
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  const patch = parseInt(parts[2]) + 1;
  return `${major}.${minor}.${patch}`;
}

function updatePackageJson(newVersion) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`📦 Updated package.json: ${oldVersion} → ${newVersion}`);
  
  return oldVersion;
}

function updatePwaAssets(newVersion) {
  const pwaAssetsPath = path.join(process.cwd(), 'src', 'pwa-assets.ts');
  
  if (!fs.existsSync(pwaAssetsPath)) {
    console.log('⚠️  pwa-assets.ts not found, skipping update');
    return;
  }
  
  let content = fs.readFileSync(pwaAssetsPath, 'utf8');
  
  // Update the version in the getAppVersion function
  const versionRegex = /return\s+['"`][\d.]+['"`]/;
  const newVersionLine = `return '${newVersion}'`;
  
  if (versionRegex.test(content)) {
    content = content.replace(versionRegex, newVersionLine);
    fs.writeFileSync(pwaAssetsPath, content);
    console.log(`📦 Updated pwa-assets.ts: version → ${newVersion}`);
  } else {
    console.log('⚠️  Could not find version in pwa-assets.ts to update');
  }
}

function updateIndexHtml(newVersion) {
  const indexHtmlPath = path.join(process.cwd(), 'index.html');
  
  if (!fs.existsSync(indexHtmlPath)) {
    console.log('⚠️  index.html not found, skipping update');
    return;
  }
  
  let content = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Update the version in the meta tag
  const metaRegex = /<meta name="application-version" content="[\d.]+" \/>/;
  const newMetaTag = `<meta name="application-version" content="${newVersion}" />`;
  
  // Update the version in the comment
  const commentRegex = /<!-- Version: [\d.]+ -->/;
  const newComment = `<!-- Version: ${newVersion} -->`;
  
  if (metaRegex.test(content) && commentRegex.test(content)) {
    content = content.replace(metaRegex, newMetaTag);
    content = content.replace(commentRegex, newComment);
    fs.writeFileSync(indexHtmlPath, content);
    console.log(`📦 Updated index.html: version → ${newVersion}`);
  } else {
    console.log('⚠️  Could not find version tags in index.html to update');
  }
}

function main() {
  console.log('🔍 Checking for source changes...');
  
  if (!hasSourceChanges()) {
    console.log('✅ No source changes detected, skipping version bump');
    return;
  }
  
  // Read current version
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;
  
  // Increment patch version
  const newVersion = incrementVersion(currentVersion);
  
  // Update files
  updatePackageJson(newVersion);
  updatePwaAssets(newVersion);
  updateIndexHtml(newVersion);
  
  console.log('✅ Version bump completed successfully!');
}

if (require.main === module) {
  main();
}

module.exports = { hasSourceChanges, incrementVersion, updatePackageJson, updatePwaAssets };
