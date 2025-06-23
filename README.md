# AI search agent 
## Installation

> Windows is only supported through a Linux virtual environment of some kind, such as [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

You will need [Node.js 22](#nodejs-22) and [dfx](#dfx) to develop ICP applications with Azle:

### Node.js

It's recommended to use nvm to install the latest LTS version of Node.js:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
```

Restart your terminal and then run:

```bash
nvm install --lts
```

Check that the installation went smoothly by looking for clean output from the following command:

```bash
node --version
```

### dfx

Install the dfx command line tools for managing ICP applications:

```bash
DFX_VERSION=0.27.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

Check that the installation went smoothly by looking for clean output from the following command:

```bash
dfx --version

```
* Get your API Key and CSE ID: Follow the official Google documentation: [https://developers.google.com/custom-search/v1/overview](https://developers.google.com/custom-search/v1/overview).

## Deployment


```bash
#open ai_search_engine dir
cd ai_search_engine
```

```bash
# install all npm dependencies including azle
npm install
```

```bash
# start up a local ICP replica
dfx start --background
```
```bash
#set enviroment variable on the shell
#linux
export GEMINI_API_KEY="__key__"
export GOOGLE_CSE_ID="__id__"
export GOOGLE_CSE_API_KEY="__key__" 
#windows
set  GEMINI_API_KEY="__key__"
set GOOGLE_CSE_ID="__id__"
set GOOGLE_CSE_API_KEY="__key__" 


```bash
# deploy your canister
dfx deploy
```


```
