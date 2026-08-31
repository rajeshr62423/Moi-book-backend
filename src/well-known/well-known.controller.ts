import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

/**
 * Serves Android App Links (assetlinks.json) and iOS Universal Links
 * (apple-app-site-association) verification files at the well-known path.
 *
 * Responses are written directly via @Res() to bypass the global
 * ResponseInterceptor envelope — both files must be returned as the raw
 * JSON body their respective OS crawlers expect, with no wrapping and no
 * redirect (Apple's crawler in particular does not follow redirects).
 */
@Controller('.well-known')
export class WellKnownController {
  @Get('assetlinks.json')
  getAndroidAssetLinks(@Res() res: Response): void {
    res.status(200).json([
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.moibooknativeapp',
          sha256_cert_fingerprints: [
            'FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C',
          ],
        },
      },
    ]);
  }

  @Get('apple-app-site-association')
  getAppleAppSiteAssociation(@Res() res: Response): void {
    // TODO: replace TEAMID with the actual Apple Developer Team ID before deploying.
    res.status(200).json({
      applinks: {
        apps: [],
        details: [
          {
            appID: 'TEAMID.com.moibooknativeapp',
            paths: [
              '/dashboard',
              '/events*',
              '/moi*',
              '/guests*',
              '/vendors*',
              '/ledger*',
            ],
          },
        ],
      },
    });
  }
}
