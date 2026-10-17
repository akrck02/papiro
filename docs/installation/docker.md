# Use papiro as a docker container 🐳
---

Papiro is published as a container image for amd64 and arm64: `ghcr.io/akrck02/papiro`.
It indexes the documents in `/resources/uploads`, serves the wiki on port `8000`, and indexes
them again a few seconds after they change. Obsidian vaults (a folder with `.obsidian`) are
detected.

For the sake of simplicity we will use docker compose in this example, feel free to use whatever
you prefer.

```yaml
services:
  papiro:
    container_name: papiro
    image: ghcr.io/akrck02/papiro:latest
    volumes:
      - ./my-documents:/resources/uploads
    environment:
      PAPIRO_TITLE: "My wiki"       # the title of the wiki
      PAPIRO_WATCH_SECONDS: 5       # how often to look for changes, 0 to never
    ports:
      - 80:8000
    restart: always
```

Add your documents to the `my-documents` directory and start the container using:
> docker compose up

---

> Congratulations 🎉🎉 <br> --- your wiki is now ready to visit in your domain running as a docker container. ---
