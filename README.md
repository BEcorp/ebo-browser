# EBO Browser Extension Fork

This is a forked version of EBO which is a start point for BEIO browser wallet.

## Fork notes

We want to preserve as much of original code as possible and be able to keep our fork in sync with the original code base. This will allow us to reuse the improvements and bugfixes introduced there. Our goal is to focus on fork branding and maintaining only parts that are specific to our version of the plugin.

Please list all your changes to FORK_CHANGELOG.md. It should be easy to track how much we are different from original and might need to be prepered for any breaking changes in the EBO plugin.

## Syncing with upstream

After cloning this repo locally you rill need to set up a remote upstream
`git remote add upstream https://github.com/MetaMask/metamask-extension.git`

We are going to sync master branch which holds production ready code of the plugin
```
git fetch upstream
git checkout master
git merge upstream/master
```

More details here:
https://help.github.com/en/articles/fork-a-repo#keep-your-fork-synced


## Branching strategy

To separate our branches from original codebase we're going to use `beio` prefix.

`beio-master` is production ready version of our fork, it should contain all changes to the original code, please branch out from this for any feature development
`beio-develop` is development branch where we merge feature branches for QA before we merge them to beio-master for release

After syncing with upstream we will like to merge all improvements and bugfixes. To do this we will typically create a temporary `beio-sync` branch out of `beio-master`. Then we will merge `master` to `beio-sync`, resolve any possible merge conflicts and merge back to `beio-master`
