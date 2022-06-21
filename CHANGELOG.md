## [2.0.3](https://github.com/jwplayer/ott-web-app/compare/v2.0.2...v2.0.3) (2022-06-21)


### Bug Fixes

* **playlist:** smooth transition on hover ([0ab070f](https://github.com/jwplayer/ott-web-app/commit/0ab070ff7a36a2498caf562a3fafc63c6f534e68))



## [2.0.2](https://github.com/jwplayer/ott-web-app/compare/v2.0.1...v2.0.2) (2022-06-08)


### Bug Fixes

* add docs for versioning and test changelog ([#80](https://github.com/jwplayer/ott-web-app/issues/80)) ([cc3695d](https://github.com/jwplayer/ott-web-app/commit/cc3695d9ee30b759001671460a407d7d70e218fc))
* test version bump ([716b289](https://github.com/jwplayer/ott-web-app/commit/716b289f0780964c2b0954b17e59456952dad9d2))
* update docs and test version bump ([cfa4b2d](https://github.com/jwplayer/ott-web-app/commit/cfa4b2d09b7b963c93a4815526071d68e28083cc))



## [2.0.1](https://github.com/jwplayer/ott-web-app/compare/v2.0.0...v2.0.1) (2022-06-07)


### Bug Fixes

* use action token for version bump workflow ([50e95c8](https://github.com/jwplayer/ott-web-app/commit/50e95c8bf9682d52730c8654baac3efbabe3c3b9))



# [2.0.0](https://github.com/jwplayer/ott-web-app/compare/v2.0.0-alpha...v2.0.0) (2022-06-03)


### Bug Fixes

* **auth:** clear subscription, transactions and payment after logout ([d977dcc](https://github.com/jwplayer/ott-web-app/commit/d977dccb3946f6abbe9e283c4ee62cfa4677b198))
* **auth:** prevent login error when watch history item is removed ([cfc82ec](https://github.com/jwplayer/ott-web-app/commit/cfc82ec0f393cbc11c19f075fa1b09e3a19dafce))
* **entitlement:** improve entitlement mechanism ([4a7cba7](https://github.com/jwplayer/ott-web-app/commit/4a7cba7b7b9b4002c48d12344ac38e3174abe717))
* **payment:** clear the order after closing the checkout modal ([3f590d7](https://github.com/jwplayer/ott-web-app/commit/3f590d76e1226926d483b77d923af590b20f5fdb))
* **payment:** fix incorrect svod redirect ([cf3bd7d](https://github.com/jwplayer/ott-web-app/commit/cf3bd7da9d76d7ecd34cd576605704c140500fbe))
* **payment:** fix offer not always being selected ([23c67c2](https://github.com/jwplayer/ott-web-app/commit/23c67c23d045274312edda75fe7e112cd4ae94c1))
* **payment:** show offer modal after registration in authvod platform ([0071c63](https://github.com/jwplayer/ott-web-app/commit/0071c638c7580cd91c3e949827522648341253cf))
* **payment:** tvod checkout fixes for authvod platform ([31325e4](https://github.com/jwplayer/ott-web-app/commit/31325e420c07609c81d6874220dfc84ad9b61023))
* react query staleTime wrong value ([020a06a](https://github.com/jwplayer/ott-web-app/commit/020a06a87139acc67c6e7c044955a91f425b80d7))
* **series:** fix start watching button url ([833c364](https://github.com/jwplayer/ott-web-app/commit/833c364d0695ee727aeae718ca2f07eb1d28279e))
* **signing:** prevent signing when DRM is disabled ([0d70e99](https://github.com/jwplayer/ott-web-app/commit/0d70e994edcce17b5ef22d2a0c38120fd22e4029))
* upgrade packages to resolve vulnerabilities ([#53](https://github.com/jwplayer/ott-web-app/issues/53)) ([c2d1efc](https://github.com/jwplayer/ott-web-app/commit/c2d1efcc7390ff2a4961eac59415696259d1d29d))
* **user:** show payments menu in authvod access model ([6e2671a](https://github.com/jwplayer/ott-web-app/commit/6e2671a4f082d93152addf87a5a4222622c67383))
* **videodetail:** prevents flash when navigating to movie page ([9c320bc](https://github.com/jwplayer/ott-web-app/commit/9c320bc9b27b08d078cdbfc4e125a2e357bc3f69))


### Features

* **auth:** reload subscriptions, transactions and payment parallel ([8b526b0](https://github.com/jwplayer/ott-web-app/commit/8b526b0cb8dbf6d1af8c4a21061dd3cf5728fd6b))
* **entitlement:** add tvod entitlement check to movie screen ([5c5e388](https://github.com/jwplayer/ott-web-app/commit/5c5e3886360ad7e6da01a9401ca98ccc1d71a8f4))
* **entitlement:** prevent UI blocking while loading auth or subscriptions ([fefab30](https://github.com/jwplayer/ott-web-app/commit/fefab30aaa7f6b90855d54c0ccda11f4ca0d4316))
* **payment:** add tvod to checkout ([c92bb15](https://github.com/jwplayer/ott-web-app/commit/c92bb15d51c580fb6b76089ede200236724edf4e))
* **payment:** add tvods to choose offer modal ([bc8e6d7](https://github.com/jwplayer/ott-web-app/commit/bc8e6d7efde7b1e7b05371f6cbdddf2010b59fed))
* **payment:** implement  authvod + tvod ([836e457](https://github.com/jwplayer/ott-web-app/commit/836e4574e47192d4f88ee91f178386f3e06f96ff))
* **payment:** update choose offer modal title and subtitle ([a474b2a](https://github.com/jwplayer/ott-web-app/commit/a474b2a1f213022f5b0effee955174d8210c8538))
* **project:** add Zustand dependency ([ed9968e](https://github.com/jwplayer/ott-web-app/commit/ed9968ee570a7976c81bd5ba1376d6ff6731eca2))
* **project:** cache media items from playlists ([2b8b5ee](https://github.com/jwplayer/ott-web-app/commit/2b8b5eeadaceb41a029a83548b057cab2694f85a))
* **signing:** add playlist and media entitlement using a service ([e93a655](https://github.com/jwplayer/ott-web-app/commit/e93a655ca23aa1ece62b0ade81b92612c81e5cdd))
* **videodetail:** add tvod entitlement to series screen ([b3df73e](https://github.com/jwplayer/ott-web-app/commit/b3df73e4fb8acf95e346091be263774437c22b1f))



# [2.0.0-alpha](https://github.com/jwplayer/ott-web-app/compare/v1.1.1...v2.0.0-alpha) (2022-05-06)


### Bug Fixes

* **auth:** fix console error controlled checkbox ([b4f9379](https://github.com/jwplayer/ott-web-app/commit/b4f93793c8e36d6883e1365a4517e5542f000842))
* **auth:** fix console errors ([e293764](https://github.com/jwplayer/ott-web-app/commit/e293764868a5080260cabdb9a8947e5faf88f2e6))
* **auth:** Make logout into a function ([#48](https://github.com/jwplayer/ott-web-app/issues/48)) ([97940a0](https://github.com/jwplayer/ott-web-app/commit/97940a08c76e34d999e71105834c5ac8bfe58d13))
* **auth:** prevent content shift when checking checkbox ([72ea3f6](https://github.com/jwplayer/ott-web-app/commit/72ea3f69c5bf2caee4524eb3356db17a2e7bf463))
* **e2e:** fix watchlist flaky test ([#50](https://github.com/jwplayer/ott-web-app/issues/50)) ([1974614](https://github.com/jwplayer/ott-web-app/commit/197461471b2bcd2b60aa33cc091e716c4c98e938))
* **payment:** fix Adyen form label styling ([b4f48c6](https://github.com/jwplayer/ott-web-app/commit/b4f48c64d39f989674dcf514a75c94b0492fa20b))
* **payment:** fix Adyen live environment when cleengSandbox is set to false ([4ff1e42](https://github.com/jwplayer/ott-web-app/commit/4ff1e42dd34db460a88e507f8051e1d774bceab7))
* **player:** fix autoplay ([3e7d7b4](https://github.com/jwplayer/ott-web-app/commit/3e7d7b4c6157d598b2e52c9d5534de67ed2f1eb9))
* **project:** fix DateField react error ([631e932](https://github.com/jwplayer/ott-web-app/commit/631e9327c72244b6fc43548e8cdcab08276c5bb0))
* **project:** fix for custom domains base url ([2426b27](https://github.com/jwplayer/ott-web-app/commit/2426b2770e8615af2edfbcc2d3a8b7c5bd03b08e))
* **project:** fix getPublicUrl for dev builds ([ec9bc60](https://github.com/jwplayer/ott-web-app/commit/ec9bc605242b51c336da128c0af1d81bf2184154))
* **project:** use json property from description blob ([c1c0fee](https://github.com/jwplayer/ott-web-app/commit/c1c0feeb3a78833ea2c03b38573b83b7fc37fdc7))
* remove unfinished mutations for consents and customer data and move logic to account store ([#17](https://github.com/jwplayer/ott-web-app/issues/17)) ([4a75628](https://github.com/jwplayer/ott-web-app/commit/4a75628c927161ef195b93743a2796e59b068285))


### Features

* **auth:** add backdrop click to login codecept test ([9a29722](https://github.com/jwplayer/ott-web-app/commit/9a29722eddbe8eb513c0094bc780969bccbf0b74))
* **auth:** add login codecept tests ([1d74a18](https://github.com/jwplayer/ott-web-app/commit/1d74a18ce280c6162cb99102caf6b5fe1a7a413f))
* **auth:** add register codecept tests ([b4bc475](https://github.com/jwplayer/ott-web-app/commit/b4bc475aafa39059ba31da9cce851266e1500d88))
* **home:** add codecept tests ([5f6c38d](https://github.com/jwplayer/ott-web-app/commit/5f6c38db0317ef70a1ccd9b8b50c6a48fe122705))
* **project:** add github pages deployment ([8484572](https://github.com/jwplayer/ott-web-app/commit/8484572d8f6662ae29eb525addbf4b62e9381e06))
* **project:** add not found pages and 404.html for github pages ([3249d63](https://github.com/jwplayer/ott-web-app/commit/3249d633ab75971c7720c180e1762553d5f70f9e))
* **project:** hash based router for github pages ([2250f33](https://github.com/jwplayer/ott-web-app/commit/2250f33eebd78ecbe861928db0df8e8e67bda0d5))
* **user:** add account codecept test ([f7e9395](https://github.com/jwplayer/ott-web-app/commit/f7e93959011990f9af8845d2418196fdff9d39c9))
* **user:** add payments codecept tests ([70521df](https://github.com/jwplayer/ott-web-app/commit/70521dfd7d72c72c87e6e324fd640c3d1b9506d2))
* **videodetail:** add codecept tests ([5fd6931](https://github.com/jwplayer/ott-web-app/commit/5fd6931762cd4d5bf8a972d4f054dbdf215beef7))
* **watchhistory:** add codecept test ([120055f](https://github.com/jwplayer/ott-web-app/commit/120055f1fd31a1884fd552f44933a5880e53364b))
* **watchhistory:** add mobile codecept test and login step ([1467b44](https://github.com/jwplayer/ott-web-app/commit/1467b44d6a67d7fd4cd0db36fefa520cac48a289))



