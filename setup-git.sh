#!/bin/bash
cd /Users/peterdoust/Documents/augment-projects/engel/glamm-hair-site
rm -rf .git
git init
git add .
git commit -m "Initial commit - Glamm Hair site"
git remote add origin https://github.com/peterdoust/glamm-hair-site.git
git branch -M main
git push -u origin main --force
echo "DONE - Check GitHub Desktop now"

