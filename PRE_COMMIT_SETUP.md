# Pre-Commit Build Check Setup

This will prevent broken builds from being deployed to Vercel by running a build check before every commit.

## Option 1: Simple Pre-Commit Hook (Recommended)

### Step 1: Install Dependencies
Run in your terminal (Command Prompt or Git Bash, NOT PowerShell):
```bash
npm install --save-dev husky
```

### Step 2: Initialize Husky
```bash
npx husky init
```

### Step 3: Create Pre-Commit Hook
Create or edit the file `.husky/pre-commit` with this content:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔨 Running build check before commit..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Please fix errors before committing."
  exit 1
fi

echo "✅ Build successful! Proceeding with commit."
```

---

## Option 2: Faster Pre-Commit (Type-check only)

If full build is too slow, you can just run type-checking:

`.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running TypeScript type-check..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ Type errors found! Please fix before committing."
  exit 1
fi

echo "✅ Type-check passed!"
```

---

## Option 3: Most Complete (Recommended for Production)

Add type-check + linting:

`.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running checks before commit..."

# Type-check
echo "  → TypeScript type-check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ Type errors found!"
  exit 1
fi

# Lint
echo "  → ESLint check..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting errors found!"
  exit 1
fi

echo "✅ All checks passed!"
```

---

## How to Install (Step-by-Step)

### 1. Open Git Bash or Command Prompt (NOT PowerShell)
Navigate to your project:
```bash
cd C:/Users/ofacl/OneDrive/שולחן\ העבודה/hachlamti
```

### 2. Install Husky
```bash
npm install --save-dev husky
```

### 3. Initialize Husky
```bash
npx husky init
```

This creates `.husky/` folder with a sample pre-commit hook.

### 4. Edit `.husky/pre-commit`
Replace its content with one of the options above (I recommend Option 3).

### 5. Make it executable (Git Bash only)
```bash
chmod +x .husky/pre-commit
```

### 6. Test it
```bash
git add .
git commit -m "test: pre-commit hook"
```

You should see the checks running!

---

## Benefits

✅ **No more broken deploys** - Build errors caught locally  
✅ **Faster feedback** - Find issues before pushing  
✅ **Clean commit history** - Only working code gets committed  
✅ **Team consistency** - Everyone runs same checks  

---

## Skip Hook (Emergency Only)

If you REALLY need to skip the hook:
```bash
git commit -m "message" --no-verify
```

**⚠️ Use sparingly!**

---

## Notes

- First commit after setup will be slower (installing dependencies)
- Full build takes ~30-60 seconds
- Type-check only takes ~5-10 seconds
- Consider Option 2 or 3 for daily development, Option 1 before pushing

---

## Alternative: Pre-Push Hook

If pre-commit is too slow, use pre-push instead:

Create `.husky/pre-push`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔨 Running build before push..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix errors before pushing."
  exit 1
fi

echo "✅ Build successful!"
```

This only runs when you `git push`, not on every commit.

