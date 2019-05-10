# Only Annotations
#### Steps new workspace Ionic Project (basically)
```shell
$ npm i -g cordova ionic
$ npm install
$ ionic cordova prepare
$ ### Step necessary when running on DevApp (iPhone/iPad) otherwise the Maps will not be loaded correctly
$ ionic cordova plugin add cordova-plugin-whitelist 
```
#### Plugins installed (when start the project from scratch, that's not needed to do when package.json is already mounted)
```shell
$ npm install @ionic/storage --save
$ npm install leaflet --save   
$ npm install @angular/animations --save
$ npm install @ionic-angular --save
$ ionic cordova plugin add cordova-plugin-geolocation
$ npm install @ionic-native/geolocation --save
$ ionic plugin add cordova-plugin-whitelist
$ npm install leaflet-touch-helper --save
$ ionic cordova plugin add cordova-plugin-local-notification
$ npm install @ionic-native/local-notifications
$ ionic cordova plugin add cordova-plugin-background-mode
$ npm install @ionic-native/background-mode
$ ionic cordova plugin add cordova-plugin-screen-orientation
$ npm install @ionic-native/screen-orientation
$ ionic cordova plugin add cordova-plugin-insomnia
$ npm install @ionic-native/insomnia
```
#### Development Server
```shell
$ ionic serve -c ## Print app console logs to Ionic CLI
$ ionic serve -l ## Test your apps on multiple platform types in the browser
$ ionic serve --prod ## Build the application for production
$ ionic serve --devapp ## Get available for devapp conection
$ ionic serve --help ## See all available options
```
---
## Plugins
#### Check Plugins Outdated
```shell
$ npm outdated
```
#### Check Outdate packages (install plugin for that)
```shell
$ npm install -g npm-check
$ npm-check
$ npm-check --skip-unused
```
#### Update Plugins
```shell
## Better option until now
$ npm i -g npm-check-updates
$ ncu -u
$ npm install
## Simple Version
$ npm update (simple version)
## Update package.json, etc.
$ npm i -g npm-check-updates && ncu -u && npm i
```

#### Install OpenStreetMaps Plugin (no need if fresh start)
```shell
$ npm install leaflet --save
```
#### Cordova Plugin Geolocation (openstreetmaps) to work on devices
```shell
$ ionic cordova plugin add cordova-plugin-geolocation
$ npm install @ionic-native/geolocation --save
```
#### Animations
```shell
$ npm install --save web-animations-js
```
#### Local Notifications Plugin
```shell
$ ionic cordova plugin add cordova-plugin-local-notification
$ npm install @ionic-native/local-notifications
```
---
## Platforms
#### Android
```shell
$ ionic cordova run android --prod
```
#### iOS
```shell
## List iOS 
$ ionic cordova emulate --list
## Build
$ ionic cordova build
## Emulate
$ ionic cordova emulate ios
## Generate Project X-Code
$ ionic cordova build ios --prod
## Emulate with Livereload and Console logs on the IONIC Cli
$ ionic cordova emulate ios --lireload --consolelogs
$ ionic cordova emulate ios --target "iPhone-SE" --livereload --consolelogs
## Run
$ ionic cordova emulate ios
## First option to Emulate specific Device
$ ionic cordova emulate ios --target "iPhone-X"
$ ionic cordova emulate ios --target "iPad-Pro"

## Just in case, if any problems with iOS versions, etc., trying some alternatives...
$ ionic cordova run ios -- --buildFlag="-UseModernBuildSystem=0"
$ ionic cordova emulate ios -- --buildFlag="-UseModernBuildSystem=0"
$ cordova run ios --debug --target "iPhone-8" --buildFlag='-UseModernBuildSystem=0'
```
#### Browser Desktop
```shell
## Add Platform if not present
$ ionic cordova platform add browser
## Run it
$ ionic cordova run browser
```
---
## Troubleshootings

### Error:
```diff
$ ionic build prod
-Error: The Angular Compiler requires TypeScript >=3.1.1 and <3.3.0 but 2.6.2 was found instead. 
```
##### Solution (https://bit.ly/2IxKCJc)
```shell
$ npm i typescript@3.1.6 --save-dev --save-exact
$ npm i
```
---
### Error:
```diff
$ ionic build prod
-Error: [ERROR] Could not find cordova integration in the default project
```
##### When
Trying to get running the DevApp iOS App at iPhone/iPad
##### Solution
```shell
$ ionic cordova prepare
$ ionic serve --devapp
```
---
#### Ualter Jr.
