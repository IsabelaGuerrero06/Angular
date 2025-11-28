// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { url } from "inspector";

export const environment = {
  production: false,
  url_backend : 'http://127.0.0.1:5000',
  url_ms_security :'https://f2fe41f8-0662-4d7b-8f9e-c4e051483e4c.mock.pstmn.io',
  url_web_socket: 'http://127.0.0.1:5000',
  url_mock_charts: 'https://a571fe5a-c44a-42b8-91be-a4f31b91d9e8.mock.pstmn.io',
  gemini_api_key: 'AIzaSyBj61AcHRtmn6kwbw314vPeNMgCufAzkis'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


