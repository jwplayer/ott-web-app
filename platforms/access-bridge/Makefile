PACKAGE_JSON := ./package.json
BACKUP_PACKAGE_JSON := ./package-backup.json
ROOT_YARN_LOCK := ../../yarn.lock
PROJECT_YARN_LOCK := ./yarn.lock

# Default target: deploy and ensure cleanup runs regardless
.PHONY: deploy
deploy: check-setup backup-package modify-package copy-yarn-lock try-deploy post-deploy

# Step 0: Check setup
.PHONY: check-setup
check-setup:
	@echo "Checking setup..."
	@command -v gcloud >/dev/null 2>&1 || { echo "Error: gcloud is not installed. Please install Google Cloud SDK."; exit 1; }
	@command -v yarn >/dev/null 2>&1 || { echo "Error: yarn is not installed. Please install Yarn."; exit 1; }
	@echo "All required tools are installed."
	@# Check if Google Cloud is configured
	@gcloud config get-value project >/dev/null 2>&1 || { echo "Error: Google Cloud project is not configured. Run 'gcloud init'."; exit 1; }
	@echo "Google Cloud is configured."

# Step 1: Backup the original package.json
.PHONY: backup-package
backup-package:
	@echo "Deployment started..."
	@cp $(PACKAGE_JSON) $(BACKUP_PACKAGE_JSON)

# Step 2: Modify `package.json` by removing internal dependencies
# In a monorepo setup, internal packages are not deployed. This step ensures that only the relevant,
# external dependencies are included in the `package.json` for deployment.
.PHONY: modify-package
modify-package:
	@# Use `sed` to remove specific internal dependencies by editing package.json in place
	@sed -i.bak '/"@jwp\/ott-common"/d' $(PACKAGE_JSON)
	@sed -i.bak '/"eslint-config-jwp"/d' $(PACKAGE_JSON)
	@rm -f $(PACKAGE_JSON).bak

# Step 3: Copy the root `yarn.lock` to the project directory
# To maintain dependency consistency in a monorepo, copy the root `yarn.lock` file to the project
# directory so Google Cloud Run can correctly compare and resolve dependencies.
.PHONY: copy-yarn-lock
copy-yarn-lock:
	@cp $(ROOT_YARN_LOCK) $(PROJECT_YARN_LOCK)

# Step 4: Deploy to Google Cloud Run
.PHONY: try-deploy
try-deploy:
	@{ \
		set -e; \
		trap 'make post-deploy; exit 1;' INT TERM HUP; \
		gcloud run deploy access-bridge \
			--source=. \
			--platform=managed \
			--region= \
			--allow-unauthenticated; \
		make post-deploy; \
	}

# Step 5: Cleanup (run whether deploy succeeds or fails)
.PHONY: post-deploy
post-deploy: restore-package clean

# Step 6: Restore the original package.json
.PHONY: restore-package
restore-package:
	@mv $(BACKUP_PACKAGE_JSON) $(PACKAGE_JSON)

# Step 7: Clean up copied yarn.lock
.PHONY: clean
clean:
	@rm -f $(PROJECT_YARN_LOCK)
