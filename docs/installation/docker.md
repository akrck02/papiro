> ⚠️ This functionality is under development and has not yet been introduced. ⚠️

# Use papiro as a docker container
---

For the sake of simplicity we will use docker compose in this examples, feel free to use whatever you prefer when configuring it.

```docker-compose
services:
  papiro:
    container_name: papiro
    image: akrck02/papiro:latest
    volumes:
      - uploads:/resources/uploads
    ports:
      - 80:8000
    restart: always
```

Add your documents to the uploads directory and start the container using:
> docker compose up

---

> Congratulations 🎉🎉 <br> --- your wiki is now ready to visit in your domain running as a docker container. ---
