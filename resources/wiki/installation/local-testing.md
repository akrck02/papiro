# Local testing 🧪
---

Download the latest papiro version from [the official github repository.](https://github.com/akrck02/papiro)
In case your testing on a local machine, just enter the repository directory using the following command.

```bash
cd ./papiro
```

Once there the typescript must be transpiled using the following command.

```bash
tsc
```

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

now that you have everything ready run the following command to convert the markdowns to html and index them in the index.json file

> Congratulations 🎉🎉 <br> --- your wiki is now ready to visit in the local environment. ---
