# Local testing 🧪
---

Download the latest papiro version from [the official github repository.](https://github.com/akrck02/papiro)
and enter its directory.

```bash
cd ./papiro
```

Then preview any folder of markdown documents, or an Obsidian vault:

```bash
./bin/preview.sh ~/notes/my-vault
```

The script builds papiro, indexes your documents (Obsidian vaults are detected by their
`.obsidian` folder) and serves the wiki locally. It only needs python3, and go on systems other
than linux x86-64, where it builds esbuild and the papiro indexer the first time.

Once done, the web will be launched in the following URL.
> [http://127.0.0.1:8000](http://127.0.0.1:8000)

Run the script again after changing your documents, or pass another port as the second argument.

> Congratulations 🎉🎉 <br> --- your wiki is now ready to visit in the local environment. ---
