/* Main app configs go here */
const deployed = require('./deployed.json')

export const appConfig = {
  name: 'Balancer',
  shortName: 'Balancer',
  description: '',
  splashScreenBackground: '#ffffff',
  factory: deployed.factoryAddress
}
