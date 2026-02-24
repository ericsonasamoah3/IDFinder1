import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "eu-north-1_xcBhiUx4n",
      userPoolClientId: "6i3v8mhfmn977sjp0r0h8dqh1v",
      loginWith: {
        oauth: {
          domain: "idfinder-app.auth.eu-north-1.amazoncognito.com",
          scopes: ["openid", "email"],
          redirectSignIn: ["http://localhost:5173", "https://d84l1y8p4kdic.cloudfront.net","https://master.dfkf39t8knl1f.amplifyapp.com"],
          redirectSignOut: ["http://localhost:5173", "https://d84l1y8p4kdic.cloudfront.net","https://master.dfkf39t8knl1f.amplifyapp.com"],
          responseType: "code",
        },
      },
    },
  },
});