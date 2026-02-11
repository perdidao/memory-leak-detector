# Chrome Web Store Submission Checklist

Use this checklist before submitting your extension to the Chrome Web Store to avoid common rejection reasons.

## ✅ Pre-Submission Checklist

### 1. Environment Setup

- [ ] Node.js version is 20.19+ or 22.12+ (`node --version`)
- [ ] All dependencies are installed (`npm install`)

### 2. Code Quality

- [ ] No TypeScript errors (`tsc -b`)
- [ ] No linting errors (`npm run lint`)
- [ ] All code is formatted and clean

### 3. Build Verification

- [ ] Build completes successfully (`npm run build`)
- [ ] `dist` folder is created
- [ ] `dist/content/contentScript.js` exists (CRITICAL)
- [ ] `dist/content/injected.js` exists
- [ ] `dist/manifest.json` exists
- [ ] All icon files exist (icon16.png, icon48.png, icon128.png)
- [ ] `dist/index.html` exists

### 4. Manifest Configuration

- [ ] Version number is updated in `public/manifest.json`
- [ ] Version matches `package.json`
- [ ] All permissions are necessary and used
- [ ] No unused permissions declared
- [ ] Content script paths are correct
- [ ] Web accessible resources are declared

### 5. Local Testing

- [ ] Extension loads without errors in Chrome
- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Content script injects successfully
- [ ] Test on http:// website
- [ ] Test on https:// website
- [ ] "Start Audit" button works
- [ ] Statistics are collected and displayed
- [ ] "Stop Audit" button works
- [ ] No console errors

### 6. Privacy & Documentation

- [ ] PRIVACY.md is up to date
- [ ] All permissions are documented in PRIVACY.md
- [ ] README.md is complete
- [ ] No data collection in code
- [ ] No external API calls

### 7. Package Creation

- [ ] Create zip of dist folder **contents** (not the folder itself)
- [ ] Verify zip file structure is correct
- [ ] Zip file size is reasonable (< 5MB)

### 8. Chrome Web Store Dashboard

- [ ] Store listing title is accurate
- [ ] Description is clear and complete
- [ ] Screenshots are up to date
- [ ] Privacy policy link is provided
- [ ] All required fields are filled
- [ ] Category is correct
- [ ] Language is set correctly

## 🔍 Common Rejection Reasons

### Yellow Magnesium: Minimum Functionality

**Issue**: "Could not load javascript 'content/contentScript.js'"

**How to fix**:

- Verify the file exists in `dist/content/contentScript.js`
- Check Node.js version (must be 20.19+ or 22.12+)
- Rebuild with correct configuration

### Purple Potassium: Permission Usage

**Issue**: "Requesting but not using these permissions"

**How to fix**:

- Remove unused permissions from manifest.json
- Audit all permissions - each must be actively used
- Update PRIVACY.md to reflect changes

### Creating Quality Products

**Issue**: "Not providing the promised functionality" / "Broken functionality"

**How to fix**:

- Test locally with the exact build you're submitting
- Ensure all files are in expected paths
- Verify extension works correctly
- Follow Manifest V3 migration checklist

## 📋 Files to Review Before Submission

1. **public/manifest.json**
   - Correct version
   - Only necessary permissions
   - Correct content script paths

2. **vite.config.ts**
   - Proper entry points
   - Correct output paths
   - Content scripts handled correctly

3. **PRIVACY.md**
   - Matches actual permissions used
   - Clear and accurate

4. **dist/ folder**
   - All files present
   - No broken paths
   - Content scripts generated correctly

## 🚀 Final Steps

1. [ ] All items above are checked
2. [ ] Extension tested thoroughly
3. [ ] Zip file created correctly
4. [ ] Submit to Chrome Web Store
5. [ ] Monitor for review feedback

## 📞 If Rejected

If your extension is rejected:

1. Read the rejection reason carefully
2. Check the violation ID and section
3. Fix the issue mentioned
4. Update version number
5. Rebuild and retest
6. Resubmit

Common fixes:

- Rebuild with correct Node.js version
- Remove unused permissions
- Fix file paths in manifest
- Ensure all files are included in build

## 🎯 This Submission

**Version**: 1.0.2

**Changes from previous version**:

- ✅ Fixed content script build configuration
- ✅ Removed unused `activeTab` permission
- ✅ Updated PRIVACY.md to reflect actual permissions
- ✅ Added proper build instructions
- ✅ Improved vite.config.ts for content scripts

**Permissions used**:

- `host_permissions` (http://_/_ and https://_/_) - Required to inject content scripts

**Testing completed**:

- [ ] Local testing done
- [ ] Content script loads correctly
- [ ] No console errors
- [ ] All features working
