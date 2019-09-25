# balancer-dapp
MVP dApp to demonstrate core Balancer protocol functionality

## Instructions

### Installation
- Install dependencies
    ```
    yarn
    ```
    
### Setup Environment
- You'll need a local ganache instance running and a metamask-enabled browser. The deploy script is configured to connect to the default Ganache host (localhost:8545)

### Deploy Script
- The pre-configured pool script deploys a fresh test environment, including a factory, several tokens, and a pool with those tokens as parameters. There are no cli arguments at the moment, but the parameters in the script file itself can be changed with relative ease (e.g. Number of tokens, their starting parameters)
    ```
    yarn deploy
    ```
   
- The deploy script will output a list of the newly created addresses. These can be interacted with manually. (Logging to file will be added shortly)

- You'll need to copy the factory address manually into the 'factory' field of the src/configs/config-main.js file. (Automation will be added shortly)

### Start App
- The app will live at localhost:3000, unless that port is taken in which case it will ask to use another port.
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
