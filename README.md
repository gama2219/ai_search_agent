# Azle Hello World

- [Installation](#installation)
- [Deployment](#deployment)
- [Testing](#testing)

Azle helps you to build secure decentralized/replicated servers in TypeScript or JavaScript on [ICP](https://internetcomputer.org/). The current replication factor is [13-40 times](https://dashboard.internetcomputer.org/subnets).

Azle stable mode is continuously subjected to [intense scrutiny and testing](https://github.com/demergent-labs/azle/actions), however it does not yet have multiple independent security reviews/audits.

## Stable Mode

Azle runs in stable mode by default.

This mode is intended for production use after Azle's 1.0 release. Its focus is on API and runtime stability, security, performance, TypeScript and JavaScript language support, the ICP APIs, and Candid remote procedure calls (RPC). There is minimal support for the Node.js standard library, npm ecosystem, and HTTP server functionality.

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

## Deployment


```bash
# create a new default project called hello_world
npx azle new hello_world
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

In a separate terminal in the `` directory:

```bash
# deploy your canister
dfx deploy
```


```
