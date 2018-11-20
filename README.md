## Installation
1. Create enviroment file: `cp .env.example .env`. Fill the baseURL with something like `BASE_API_URL=http://10.0.0.30:3000` where `10.0.0.30` should be changed to your own IP.
1. Create your own demo backend db. `cd demoDB && cp db.json.example db.json`.
1. Run `yarn install` or `npm install`.
1. Use cocoapods to install iOS dependencies. Locate to ios folder and run `pod install`. 
1. Run `react-native link` in project folder. 
1. Start your own local backend: `npm run start-local-backend`.
1. Run `react-native run-ios` or `react-native run-android`.
1. Install Reactotron 2.x to check app state, API requests and responses. Use `console.tron.log` to print logs into Reactotron. If you have issues in logging states into Reactotron on Android. Run `adb reverse tcp:9090 tcp:9090` to make sure the Metro Bundler port matches the Reactotron port. 

Done! 🎉


   