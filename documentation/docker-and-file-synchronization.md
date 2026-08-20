## Synchronizing files between host and container

- If you are using VS Code devcontainer, any changes made to the repo on the host will automatically be synched into the container and vice versa via a bind mount.
  - No need to do anything
  - Changes made inside the container will also be synced back to your host

- If you are using a standalone container via the instructions in the Dockerfile, all files of the repo will be copied into the container once, at creation.
  - Nothing you do inside the container will affect the original files on your host
  - Nothing you do to the files on your host will affect the files in your container
  - This means: the database on your host will also remain in its original state
  - If you want to copy changes made on the host into your container, you need to rebuild the image
    - This will reset any changes made inside the container
  - If you want to automatically synchronize parts of or the entire repo, you need to define bind mounts (`-v`) for the files or folders you want to sync, when starting the container.
    - Example (bind mounting just the database): `docker run -it -p 5173:5173 -p 5000:5000 -p 443:443 --name julian-ruf-project -v ${PWD}\backend\books.db:/workspaces/bookfinder/backend/books.db julian-ruf-project`
    - Warning: If you bind mount the entire repo, then any files created or changed by the Dockerfile (e.g. via `RUN make setup`) will not be visible in the container.
      - The files inside the container will then mirror the host repo, not the state of the repo in the image
      - This means: No data in the bookshelves table, no dist folder, no TLS certificates
      - You then need to run `make setup` inside the container yourself before you can start the servers

## Persisting library versions and vs code extensions

- Installed VS Code extension? -> add it to `.devcontainer/devcontainer.json` to persist it
- Install via npm install?
  1. cd frontend
  2. run npm install
  3. version should now have been automatically added to frontend/package.json
- Install and persist Python libraries
  1. Start the venv: `source /workspaces/bookfinder-venv/.venv/bin/activate`
  2. Install via pip: `pip install [package-name]`
  3. Find the version number in the success message
  4. Add the library with its version number to the pip install command in the Dockerfile
- Want to enforce a VS Code setting for this project? -> add it to `.vscode/settings.json` to persist it
