# balancer-dapp
MVP dApp to demonstrate core Balancer protocol functionality

## Instructions

### Installation
- Install dependencies
    ```
    yarn
    ```
    
### Setup Environment
- You'll need a local ganache instance running and a metamask-enabled browser. The deploy script is configured to connect to the default Ganache host (localhost:8545). This ganache instance should have a gas limit of 4294967295.

- Ganache-cli parameters
  ```
  ganache-cli --deterministic -l 4294967295 --allowUnlimitedContractSize
  ```

### Deploy Script
- The pre-configured pool script deploys a fresh test environment, including a factory, several tokens, and a pool with those tokens as parameters. There are no cli arguments at the moment, but the parameters in the script file itself can be changed with relative ease (e.g. Number of tokens, their starting parameters)
    ```
    yarn deploy
    ```
   
- The deploy script will output a list of the newly created addresses. These can be interacted with manually. (Logging to file will be added shortly) The factory will automatically be added to a config file and loaded by the dApp.


### Start App
- The app will live at localhost:3000, unless that port is taken in which case it will ask to use another port. You can connect to it via any metamask-enabled browser. (Make sure metamask is connected to Ganache network @ localhost:8545)
    ```
    yarn start
    ```

### Test
- No front-end tests at the moment. (Jest is included for testing React components).
    ```
    yarn test
    ```
    
### Build For Production
- Full dApp build will live in /build folder.
    ```
    yarn build
    ```
