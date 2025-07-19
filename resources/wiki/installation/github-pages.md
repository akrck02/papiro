# Publish to github pages 🌐
---

The most common use for papiro is to publish it as a github page.

## Create a github repository
---

Create a github repository for your documents and [enable the github pages feature following the official guide.](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

Upload you files to a directory inside your repository and install the [official papiro github action.](https://github.com/marketplace/actions/papiro-deploy)

### Configure papiro deploy action
---

Create a `publish-docs.yaml` file inside the `.github/workflows` directory with the following configuration:

```yaml
name: Publish documents
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: akrck02/papiro-deploy@main
        with:
          title: "title"              # your project title
          description: "description"  # your project description
          logo: "./logo.svg"          # your logo path (only svg for now)
          path: "./your-docs-path"    # the file with your markdown documents
          isObsidianProject: false    # if it is an obsidian project
          showFooter: true            # if the footer of the page must be shown
          showBreadcrumb: true        # if the breadcrumb of the page must be shown
          showStartPage: true         # if the start page must be shown
      - name: Deploy to github actions 🚀
        uses: JamesIves/github-pages-deploy-action@v4.3.0 # please checkout and give a star to this amazing action.
        with:
          branch: gh-pages            # The branch the action should deploy to.
          folder: .                   # The folder the action should deploy.
```

 This workflow will download the latest version of papiro, convert and index your documents and deploy the website to a branch called gh-pages in your repository.

> ⚠️ Make sure that the actions can write into the repository and that the gh-pages branch is used as gh-pages branch

---

> Congratulations 🎉🎉 <br> --- your wiki is now ready to visit in yourusername.github.io/your-project or your custom github domain ---
