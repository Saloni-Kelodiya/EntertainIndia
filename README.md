# 🚀 Getting started with NexJs

### Code Setup
# Install VPN Client
svn checkout https://entertainindia.com/svn/entertain-india/

# Other SVN Commands
svn update                          // Fetches latest changes from the repository and updates your working copy.
svn add --force .                   // Add Files before commit
svn commit -m "your message"        // Pushes your local changes to the repository.
svn status                          // See the modified files
svn log                             // See logs of commits
svn switch <url>                    // Switch to another branch
svn copy <trunk-url> <branches/new-feature-url> -m "Create New branch"
svn merge <branches/new-feature>    // Merge New branch to trunk
svn resolve --accept=working file1.js // Overwrite conflict from working file
svn resolve --accept=theirs-full file1.js // Overwrite conflict by upcoming server file
svn revert file.txt                 // Revert the File
svn delete file.txt                 // Delete File

### `develop`
npm install
npm run dev
npm run build

### `Error Handling`
rmdir /s /q node_modules
del /f /q package-lock.json
rm -rf node_modules package-lock.json