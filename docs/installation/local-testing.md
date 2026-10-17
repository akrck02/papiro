# Local testing 🧪
---

Download the latest papiro version from [the official github repository.](https://github.com/akrck02/papiro)
In case your testing on a local machine, just enter the repository directory using the following command.

```bash
cd ./papiro
```

Once there, bundle the typescript and build the styles with the binaries in `bin`, no node needed.

```bash
./bin/esbuild ./src/start.ts --bundle --tsconfig=tsconfig.json --outfile=./scripts/start.js
./bin/lit -f styles.env && cp styles/out/master.css styles/src/master.css
```

> To type check the code while developing, install the typescript native preview with `./bin/install-ts.sh` and run `tsgo --noEmit`.

Use the following command to launch a new webserver.
```bash
python ./server-n-cache.py
```

Once done, the web will be launched in the following URL.
> [http://127.0.0.1:8000](http://127.0.0.1:8000)

*** Warning: You need to add your markdown or html files to the web. ***

As you are in a local environment, there is no pipeline to automatically convert your files and index them in real time.
Copy your files (folders and html or markdown files) to the following path.

> resources/uploads

Then use the papiro indexer binary to convert and index your files

```bash
./bin/papiro-indexer -path ./resources/uploads -destination ./resources/wiki
```

> Congratulations 🎉🎉 <br> --- your wiki is now ready to visit in the local environment. ---
