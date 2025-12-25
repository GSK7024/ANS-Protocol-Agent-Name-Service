# 🤝 Contributing to ANS Protocol

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/GSK7024/ANS-Protocol-dev.git
cd ANS-Protocol-dev
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your own credentials (ask the team for values)
```

### 4. Run the Development Server
```bash
npm run dev
```

---

## 🔄 Git Workflow

### Before You Start Working
Always pull the latest changes first:
```bash
git pull origin main
```

### After Making Changes
```bash
git add -A
git commit -m "Brief description of what you changed"
git push origin main
```

### If There's a Conflict
```bash
git pull origin main
# Resolve conflicts in the files
git add -A
git commit -m "Resolved merge conflicts"
git push origin main
```

---

## 🌿 Using Branches (Recommended)

For bigger features, use branches to avoid conflicts:

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Make your changes...

# Push your branch
git push origin feature/your-feature-name

# Then create a Pull Request on GitHub
```

---

## 🤖 Using Antigravity (AI Coding Assistant)

When multiple people use Antigravity on the same project:

### Do's ✅
- **Always pull before starting**: `git pull origin main`
- **Commit frequently**: Small, focused commits are easier to merge
- **Communicate**: Let the team know what you're working on
- **Check git status**: Before asking AI to make changes, see what's uncommitted

### Don'ts ❌
- **Don't work on the same file simultaneously**: Coordinate with teammates
- **Don't push broken code**: Test before pushing
- **Don't commit `.env` files**: They contain secrets!

---

## 📁 Project Structure

```
ANS/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/              # Utility libraries
├── sdk/              # TypeScript SDK
├── sdk-python/       # Python SDK
├── scripts/          # Utility scripts
├── db/               # Database migrations
└── public/           # Static assets
```

---

## 💬 Communication

Before starting work:
1. Check GitHub for open issues/PRs
2. Let the team know what feature you're building
3. Pull latest changes

Happy coding! 🚀
