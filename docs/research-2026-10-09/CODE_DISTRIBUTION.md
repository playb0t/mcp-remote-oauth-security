# Code distribution map, 9 October 2026

Researcher: Alex Gercog (playb0t)

Selected implementation fragments were found under other package names and within bundled code. Structural signatures helped identify these relationships despite renaming and packaging differences. These are observations of published artifacts, not measurements of deployment or propagation speed.

The [file evidence ledger](data/code-distribution.json) contains identity, version or commit, member path, function or rule, checksums, recorded result and completeness. The [dossier](RESEARCH_DOSSIER.md) explains the method and runtime result.

## Relationship types

| Relationship | Evidence needed and limit |
| --- | --- |
| Recorded Git fork | Repository metadata names a parent. Code similarity alone is insufficient. |
| Published package under another name | Registry identity and selected function matches establish a published code relationship. |
| Bundled fragment | An archive member contains a matching function or structure; the complete product may differ. |
| Declared adapter | Published metadata supplies the stated purpose; it does not prove the full discovery route. |
| Shared helper | A selected utility or algorithm matches; project ancestry and exposure remain unestablished. |
| Structural match | The selected construction is present; origin of the whole project remains unknown. |

## npm selection

411 discovered identifiers led to 48 selected published archives. Nine records have reference-function matches, four have namespace-only results, four have generic discovery components and 31 have none of the selected indicators. The first two groups total 13 records, including upstream mcp-remote. This method uses normalized reference-family matching, separately from the Dice scores in the later cohorts. A/B/C was not assigned to this selection.

| Package | Version | Reference matches | Recorded relationship |
| --- | --- | ---: | --- |
| @abluva/mcp-remote | 2.1.0 | 8 | upstream-family-distribution |
| mcp-remote | 0.14.3 | 10 | upstream-control |
| @ignatov.dev/mcp-remote | 0.1.40 | 9 | upstream-family-distribution |
| @thespeakup/mcp-remote | 0.1.43-thespeakup.0 | 9 | upstream-family-distribution |
| @zgeoff/mcp-remote | 0.1.38 | 9 | upstream-family-distribution |
| @automattic/mcp-remote | 0.1.50 | 9 | upstream-family-distribution |
| @beeper/mcp-remote | 0.0.2 | 0 | namespace-pattern-candidate |
| @computec/mcp-remote | 0.1.32 | 0 | namespace-pattern-candidate |
| mcp-remote-alibaba-cloud | 0.1.38 | 9 | cloud-labelled-distribution |
| @automattic/mcp-wordpress-remote | 0.5.1 | 0 | declared-wordpress-adapter |
| @neworange/neworange-mcp-remote | 0.1.39 | 9 | upstream-family-distribution |
| mcp-remote-ultra | 1.0.0 | 2 | upstream-family-distribution |
| mcp-search-package | 1.0.13 | 0 | namespace-pattern-candidate |

### @abluva/mcp-remote 2.1.0

Archive SHA-256: `685a0b2cdce294873381cfaf05a6004e6086cfed20bf8f5758c85762cd085635`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-CLPRK7YI.js`. File SHA-256: `451804cbf2e6c2fb8dfa149f535bf8ed364393451e25326cb6e797911695d7cd`.

- `parseWWWAuthenticateHeader`, lines 358 to 390: `reference-function-match`; reference 0.1.38 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `parseWWWAuthenticateHeader`, lines 358 to 390: `reference-function-match`; reference 0.14.3 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `fetchProtectedResourceMetadataFromUrl`, lines 402 to 437: `reference-function-match`; reference 0.14.3 / `fetchProtectedResourceMetadataFromUrl`. Normalized SHA-256: `f0dcfbeacba42cf006ebe84703a9d467a392fb33921232b34f02134f5de834ee`.
- `discoverProtectedResourceMetadata`, lines 438 to 465: `reference-function-match`; reference 0.1.38 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `discoverProtectedResourceMetadata`, lines 438 to 465: `reference-function-match`; reference 0.14.3 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `getAuthorizationServerUrl`, lines 466 to 471: `reference-function-match`; reference 0.1.38 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getAuthorizationServerUrl`, lines 466 to 471: `reference-function-match`; reference 0.14.3 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getServerUrlHash`, lines 2018 to 2026: `md5-config-namespace`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `getServerUrlHash`, lines 2018 to 2026: `reference-function-match`; reference 0.1.38 / `getServerUrlHash`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### mcp-remote 0.14.3

Archive SHA-256: `f4ab0e33b38b24fff6a8b3234f9d683e47995ca44f3186481716d444836f7254`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-CGVEK4Z7.js`. File SHA-256: `c2317039772cf79bdba4da9349bde030c7e7f83cef702321600f3cf2be755451`.

- `parseWWWAuthenticateHeader`, lines 31912 to 31944: `reference-function-match`; reference 0.1.38 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `parseWWWAuthenticateHeader`, lines 31912 to 31944: `reference-function-match`; reference 0.14.3 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `fetchProtectedResourceMetadataFromUrl`, lines 31956 to 31991: `reference-function-match`; reference 0.14.3 / `fetchProtectedResourceMetadataFromUrl`. Normalized SHA-256: `f0dcfbeacba42cf006ebe84703a9d467a392fb33921232b34f02134f5de834ee`.
- `discoverProtectedResourceMetadata`, lines 31992 to 32019: `reference-function-match`; reference 0.1.38 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `discoverProtectedResourceMetadata`, lines 31992 to 32019: `reference-function-match`; reference 0.14.3 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `getAuthorizationServerUrl`, lines 32020 to 32025: `reference-function-match`; reference 0.1.38 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getAuthorizationServerUrl`, lines 32020 to 32025: `reference-function-match`; reference 0.14.3 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `fetchAuthorizationServerMetadata`, lines 32047 to 32058: `reference-function-match`; reference 0.14.3 / `fetchAuthorizationServerMetadata`. Normalized SHA-256: `aca793a6da6a5d96055ae64daa34506f6d6ad5b08b620118db57c3450fd82964`.
- `fetchMetadataFrom`, lines 32059 to 32094: `reference-function-match`; reference 0.14.3 / `fetchMetadataFrom`. Normalized SHA-256: `4f81ee3837875c77e03f3b59257e44999f9af461b25648400177cfed23ffc41a`.
- `getServerUrlHash`, lines 33955 to 33969: `md5-config-namespace`. Normalized SHA-256: `69d9fd99503468ffb28c976d01eb2885be0e284ef5cc74fbc61b326a723cb2c0`.
- `getServerUrlHash`, lines 33955 to 33969: `reference-function-match`; reference 0.14.3 / `getServerUrlHash`. Normalized SHA-256: `69d9fd99503468ffb28c976d01eb2885be0e284ef5cc74fbc61b326a723cb2c0`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### @ignatov.dev/mcp-remote 0.1.40

Archive SHA-256: `663b54620e960e6f8f1ac1fd0d2669bc4160af7b77929632a838e69eef98c498`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-H43SVVFU.js`. File SHA-256: `4874e2952d2d1ce606639589d267ef49a7edee11cc12aa93333e9714cd505b8f`.

- `parseWWWAuthenticateHeader`, lines 20141 to 20173: `reference-function-match`; reference 0.1.38 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `parseWWWAuthenticateHeader`, lines 20141 to 20173: `reference-function-match`; reference 0.14.3 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `fetchProtectedResourceMetadataFromUrl`, lines 20185 to 20219: `reference-function-match`; reference 0.1.38 / `fetchProtectedResourceMetadataFromUrl`. Normalized SHA-256: `3f23c7e676e974d3dc938536580ac13d5ad501e4a2481dbdd0350209d994fc31`.
- `discoverProtectedResourceMetadata`, lines 20220 to 20247: `reference-function-match`; reference 0.1.38 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `discoverProtectedResourceMetadata`, lines 20220 to 20247: `reference-function-match`; reference 0.14.3 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `getAuthorizationServerUrl`, lines 20248 to 20253: `reference-function-match`; reference 0.1.38 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getAuthorizationServerUrl`, lines 20248 to 20253: `reference-function-match`; reference 0.14.3 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `fetchAuthorizationServerMetadata`, lines 20261 to 20297: `reference-function-match`; reference 0.1.38 / `fetchAuthorizationServerMetadata`. Normalized SHA-256: `f4921bb9045fea5a192a9e0fa27ad26802e89600666a91dd6e54669724664a1d`.
- `getServerUrlHash`, lines 20942 to 20950: `md5-config-namespace`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `getServerUrlHash`, lines 20942 to 20950: `reference-function-match`; reference 0.1.38 / `getServerUrlHash`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### @thespeakup/mcp-remote 0.1.43-thespeakup.0

Archive SHA-256: `83c81d1a7f12c409ed583a44c6664052e8730ed6d69c354f48727d17232b9da9`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-PDA27W4O.js`. File SHA-256: `e65b5155e458f2d14d9e2d34ea2c46a53a45a0343650b3f21492fc01f81885a1`.

- `parseWWWAuthenticateHeader`, lines 20094 to 20126: `reference-function-match`; reference 0.1.38 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `parseWWWAuthenticateHeader`, lines 20094 to 20126: `reference-function-match`; reference 0.14.3 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `fetchProtectedResourceMetadataFromUrl`, lines 20138 to 20172: `reference-function-match`; reference 0.1.38 / `fetchProtectedResourceMetadataFromUrl`. Normalized SHA-256: `3f23c7e676e974d3dc938536580ac13d5ad501e4a2481dbdd0350209d994fc31`.
- `discoverProtectedResourceMetadata`, lines 20173 to 20200: `reference-function-match`; reference 0.1.38 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `discoverProtectedResourceMetadata`, lines 20173 to 20200: `reference-function-match`; reference 0.14.3 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `getAuthorizationServerUrl`, lines 20201 to 20206: `reference-function-match`; reference 0.1.38 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getAuthorizationServerUrl`, lines 20201 to 20206: `reference-function-match`; reference 0.14.3 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `fetchAuthorizationServerMetadata`, lines 20214 to 20250: `reference-function-match`; reference 0.1.38 / `fetchAuthorizationServerMetadata`. Normalized SHA-256: `f4921bb9045fea5a192a9e0fa27ad26802e89600666a91dd6e54669724664a1d`.
- `getServerUrlHash`, lines 21138 to 21146: `md5-config-namespace`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `getServerUrlHash`, lines 21138 to 21146: `reference-function-match`; reference 0.1.38 / `getServerUrlHash`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### @zgeoff/mcp-remote 0.1.38

Archive SHA-256: `638ca1199ebce22a01aec0bc0357fb16efc7e42304cde91ed0e7011d19188ace`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-7U5DXR5B.js`. File SHA-256: `5d0c5504871057eeb6feb74b040f754833d615c14099881a06378122d7acfc0d`.

- `parseWWWAuthenticateHeader`, lines 20094 to 20126: `reference-function-match`; reference 0.1.38 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `parseWWWAuthenticateHeader`, lines 20094 to 20126: `reference-function-match`; reference 0.14.3 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `fetchProtectedResourceMetadataFromUrl`, lines 20138 to 20172: `reference-function-match`; reference 0.1.38 / `fetchProtectedResourceMetadataFromUrl`. Normalized SHA-256: `3f23c7e676e974d3dc938536580ac13d5ad501e4a2481dbdd0350209d994fc31`.
- `discoverProtectedResourceMetadata`, lines 20173 to 20200: `reference-function-match`; reference 0.1.38 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `discoverProtectedResourceMetadata`, lines 20173 to 20200: `reference-function-match`; reference 0.14.3 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `getAuthorizationServerUrl`, lines 20201 to 20206: `reference-function-match`; reference 0.1.38 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getAuthorizationServerUrl`, lines 20201 to 20206: `reference-function-match`; reference 0.14.3 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `fetchAuthorizationServerMetadata`, lines 20214 to 20250: `reference-function-match`; reference 0.1.38 / `fetchAuthorizationServerMetadata`. Normalized SHA-256: `f4921bb9045fea5a192a9e0fa27ad26802e89600666a91dd6e54669724664a1d`.
- `getServerUrlHash`, lines 20890 to 20898: `md5-config-namespace`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `getServerUrlHash`, lines 20890 to 20898: `reference-function-match`; reference 0.1.38 / `getServerUrlHash`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### @automattic/mcp-remote 0.1.50

Archive SHA-256: `607cd96ec44ef490eff1529c53c092227a824538960daf708928149b822895d6`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-UCDPRGT4.js`. File SHA-256: `e312ce4c3035e9999b4641543a8043f57fd4858fdd4f785bebf3b2204b5cd370`.

- `parseWWWAuthenticateHeader`, lines 17847 to 17879: `reference-function-match`; reference 0.1.38 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `parseWWWAuthenticateHeader`, lines 17847 to 17879: `reference-function-match`; reference 0.14.3 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `fetchProtectedResourceMetadataFromUrl`, lines 17891 to 17925: `reference-function-match`; reference 0.1.38 / `fetchProtectedResourceMetadataFromUrl`. Normalized SHA-256: `3f23c7e676e974d3dc938536580ac13d5ad501e4a2481dbdd0350209d994fc31`.
- `discoverProtectedResourceMetadata`, lines 17926 to 17953: `reference-function-match`; reference 0.1.38 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `discoverProtectedResourceMetadata`, lines 17926 to 17953: `reference-function-match`; reference 0.14.3 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `getAuthorizationServerUrl`, lines 17954 to 17959: `reference-function-match`; reference 0.1.38 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getAuthorizationServerUrl`, lines 17954 to 17959: `reference-function-match`; reference 0.14.3 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `fetchAuthorizationServerMetadata`, lines 17967 to 18003: `reference-function-match`; reference 0.1.38 / `fetchAuthorizationServerMetadata`. Normalized SHA-256: `f4921bb9045fea5a192a9e0fa27ad26802e89600666a91dd6e54669724664a1d`.
- `getServerUrlHash`, lines 18863 to 18871: `md5-config-namespace`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `getServerUrlHash`, lines 18863 to 18871: `reference-function-match`; reference 0.1.38 / `getServerUrlHash`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### @beeper/mcp-remote 0.0.2

Archive SHA-256: `c519cff55b0fe36f7b480e968f13333b2f54672b74990f4dafaa390e31f48bf4`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/client.js`. File SHA-256: `4595da91e09dc136a37326594c3ea27f96c05df7c611884da98842535408d5a4`.

- `fp`, lines 522 to 522: `md5-input-with-oauth-storage-context`. Normalized SHA-256: `455579b16af0a65cc679121847300568ee42df5bcbf7bc1607e5648a1d98ad12`.
Member: `package/dist/proxy.js`. File SHA-256: `cf96a8e34409a5c8d9045c88f06f818a4861d160b6f20ef65c166397092f5eff`.

- `mp`, lines 523 to 523: `md5-input-with-oauth-storage-context`. Normalized SHA-256: `455579b16af0a65cc679121847300568ee42df5bcbf7bc1607e5648a1d98ad12`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### @computec/mcp-remote 0.1.32

Archive SHA-256: `98e11f2d8e6c770b539e421ade01605d281f635b202b28a945aa2592a44216bd`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-6O7LDTFM.js`. File SHA-256: `34047277a190308c1bad50d925fe58f3c10cdcc8ef939f4c5d823722574e21fb`.

- `getServerUrlHash`, lines 14281 to 14283: `md5-input-with-oauth-storage-context`. Normalized SHA-256: `455579b16af0a65cc679121847300568ee42df5bcbf7bc1607e5648a1d98ad12`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### mcp-remote-alibaba-cloud 0.1.38

Archive SHA-256: `bbb9e458f23dc51f39a4b5622e507d891fb09d67173c043bf8e020f52dbb4406`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-7U5DXR5B.js`. File SHA-256: `5d0c5504871057eeb6feb74b040f754833d615c14099881a06378122d7acfc0d`.

- `parseWWWAuthenticateHeader`, lines 20094 to 20126: `reference-function-match`; reference 0.1.38 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `parseWWWAuthenticateHeader`, lines 20094 to 20126: `reference-function-match`; reference 0.14.3 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `fetchProtectedResourceMetadataFromUrl`, lines 20138 to 20172: `reference-function-match`; reference 0.1.38 / `fetchProtectedResourceMetadataFromUrl`. Normalized SHA-256: `3f23c7e676e974d3dc938536580ac13d5ad501e4a2481dbdd0350209d994fc31`.
- `discoverProtectedResourceMetadata`, lines 20173 to 20200: `reference-function-match`; reference 0.1.38 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `discoverProtectedResourceMetadata`, lines 20173 to 20200: `reference-function-match`; reference 0.14.3 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `getAuthorizationServerUrl`, lines 20201 to 20206: `reference-function-match`; reference 0.1.38 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getAuthorizationServerUrl`, lines 20201 to 20206: `reference-function-match`; reference 0.14.3 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `fetchAuthorizationServerMetadata`, lines 20214 to 20250: `reference-function-match`; reference 0.1.38 / `fetchAuthorizationServerMetadata`. Normalized SHA-256: `f4921bb9045fea5a192a9e0fa27ad26802e89600666a91dd6e54669724664a1d`.
- `getServerUrlHash`, lines 20890 to 20898: `md5-config-namespace`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `getServerUrlHash`, lines 20890 to 20898: `reference-function-match`; reference 0.1.38 / `getServerUrlHash`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### @automattic/mcp-wordpress-remote 0.5.1

Archive SHA-256: `dde45e9d6dd82765064e836f1e699794af078424e8a4e8a36c05bdac484f6c9a`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/lib.js`. File SHA-256: `89d20226c3287fb2fc9df5d894f169fdcbd992b5837dac367d50d4f3fbffd62e`.

- `generateServerUrlHash`, lines 75622 to 75624: `md5-input-with-oauth-storage-context`. Normalized SHA-256: `455579b16af0a65cc679121847300568ee42df5bcbf7bc1607e5648a1d98ad12`.
- `getServerUrlHash`, lines 75757 to 75759: `md5-input-with-oauth-storage-context`. Normalized SHA-256: `455579b16af0a65cc679121847300568ee42df5bcbf7bc1607e5648a1d98ad12`.
Member: `package/dist/proxy.js`. File SHA-256: `418cde85b7bef0f2ffbeefb513b417ae4ffae3f1d61bd2f491193e092441c4a4`.

- `generateServerUrlHash`, lines 76323 to 76325: `md5-input-with-oauth-storage-context`. Normalized SHA-256: `455579b16af0a65cc679121847300568ee42df5bcbf7bc1607e5648a1d98ad12`.
- `getServerUrlHash`, lines 76490 to 76492: `md5-input-with-oauth-storage-context`. Normalized SHA-256: `455579b16af0a65cc679121847300568ee42df5bcbf7bc1607e5648a1d98ad12`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### @neworange/neworange-mcp-remote 0.1.39

Archive SHA-256: `3043166ac9606d4963102d05e9ef2d601c507c6dd41ebe9e74418c033333a4cf`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-U45OMYNK.js`. File SHA-256: `0e6892bc7262d81c22138ea5e67b13db35b44a4b2bd3bb122ad865e10ceca428`.

- `parseWWWAuthenticateHeader`, lines 20094 to 20126: `reference-function-match`; reference 0.1.38 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `parseWWWAuthenticateHeader`, lines 20094 to 20126: `reference-function-match`; reference 0.14.3 / `parseWWWAuthenticateHeader`. Normalized SHA-256: `ffe2ef0c04d8e1123711754846cafb743c0a084768a0e4355fcb380d12d321dc`.
- `fetchProtectedResourceMetadataFromUrl`, lines 20138 to 20172: `reference-function-match`; reference 0.1.38 / `fetchProtectedResourceMetadataFromUrl`. Normalized SHA-256: `3f23c7e676e974d3dc938536580ac13d5ad501e4a2481dbdd0350209d994fc31`.
- `discoverProtectedResourceMetadata`, lines 20173 to 20200: `reference-function-match`; reference 0.1.38 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `discoverProtectedResourceMetadata`, lines 20173 to 20200: `reference-function-match`; reference 0.14.3 / `discoverProtectedResourceMetadata`. Normalized SHA-256: `0090173fc1722883f7407b2404f667324757829760a19815bad07209d87119ab`.
- `getAuthorizationServerUrl`, lines 20201 to 20206: `reference-function-match`; reference 0.1.38 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `getAuthorizationServerUrl`, lines 20201 to 20206: `reference-function-match`; reference 0.14.3 / `getAuthorizationServerUrl`. Normalized SHA-256: `27355ffb99dec7d4729f588fc6a920305d8f175cdab26b27a55c6e0d16f44594`.
- `fetchAuthorizationServerMetadata`, lines 20214 to 20250: `reference-function-match`; reference 0.1.38 / `fetchAuthorizationServerMetadata`. Normalized SHA-256: `f4921bb9045fea5a192a9e0fa27ad26802e89600666a91dd6e54669724664a1d`.
- `getServerUrlHash`, lines 20890 to 20898: `md5-config-namespace`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `getServerUrlHash`, lines 20890 to 20898: `reference-function-match`; reference 0.1.38 / `getServerUrlHash`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### mcp-remote-ultra 1.0.0

Archive SHA-256: `fac21cb0582a04abbe6d7cdf6577eb70fad6b2ea8adf6a43533ce83610113937`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/dist/chunk-M36YVINN.js`. File SHA-256: `62c5296bd778c8829280ab2a1a38deb70c193451eb5a0c2710e1ee1ed42f6630`.

- `getServerUrlHash`, lines 20903 to 20911: `md5-config-namespace`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `getServerUrlHash`, lines 20903 to 20911: `reference-function-match`; reference 0.1.38 / `getServerUrlHash`. Normalized SHA-256: `c626f1765da978807b9ce0c0d9b2a7149a4f9042a235a5d1767e3b4647d44626`.
- `fetchAuthorizationServerMetadata`, lines 20937 to 20973: `reference-function-match`; reference 0.1.38 / `fetchAuthorizationServerMetadata`. Normalized SHA-256: `f4921bb9045fea5a192a9e0fa27ad26802e89600666a91dd6e54669724664a1d`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

### mcp-search-package 1.0.13

Archive SHA-256: `719c592d57173cbf928f110687cd65a9938ad7ce58c71748fdff821a85b0774a`.

Recorded result: namespace-or-reference-match. Complete within the saved scan scope: true.

Member: `package/node_modules/mcp-remote/dist/chunk-S7ORXPZR.js`. File SHA-256: `2cf1bc24868216a831458207c80062f806704e2b95da3d6ba41f5792b071f439`.

- `getServerUrlHash`, lines 13669 to 13671: `md5-input-with-oauth-storage-context`. Normalized SHA-256: `455579b16af0a65cc679121847300568ee42df5bcbf7bc1607e5648a1d98ad12`.

Selected matches establish code presence at function or structural level. Deployment and complete downstream request behavior remain unestablished.

Ultra has exactly two normalized reference matches, `getServerUrlHash` and `fetchAuthorizationServerMetadata`, plus one namespace result. Other package components may have been implemented independently. Alibaba-labelled and WordPress-adapter roles describe published metadata; corporate ownership and internal use are not inferred.

## Separate Git file selection

The selection contains 232 file records from 221 repositories, with 225 unique Git blobs: 222 JS/TS files and ten other records. Categories are A=0, B=9, C=223. Nine files contain the selected delimiter-MD5 construction, including the upstream file. Six exceed the function threshold; structural rules retain the other three. They are not added to the npm count as unique products.

### krafton-ai/KIRA

Commit: `652dacbf14d29ea93a83c496ee91e0e5ba286721`. [Source](https://github.com/krafton-ai/KIRA/blob/652dacbf14d29ea93a83c496ee91e0e5ba286721/KiraClaw/apps/desktop/lib/register-ipc.js).
Member: `KiraClaw/apps/desktop/lib/register-ipc.js`. SHA-256: `82d0d1fcc203294f6e8feff4710f494829b8c9da95faa2586506f0b319f4bc6f`.
Recorded result: B; AST complete; Semgrep complete.

- `getServerUrlHash`, line 262; function similarity 0.907563; normalized SHA-256 `ba33959b630397850178fc800e2789af333b4bb3436ba11610afc3aa08e777d6`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

### punkpeye/mcp-remote

Commit: `6a06aca546a8fd3b7beb040f39761b364893198d`. [Source](https://github.com/punkpeye/mcp-remote/blob/6a06aca546a8fd3b7beb040f39761b364893198d/src/lib/utils.ts).
Member: `src/lib/utils.ts`. SHA-256: `dfaa90fcb51f573ab3960444c5a7eb1167aae64e379f8d37704f5111f27365f0`.
Recorded result: B; AST complete; Semgrep complete.

- `getServerUrlHash`, line 3232; function similarity 0.440476; normalized SHA-256 `e116b244962eef346e01d355705ac36c3a243e886c363dd46754c0a39a372f3b`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

### patleeman/neon-pilot

Commit: `49aa6d404a1ccc4473b79c7b90d55a77f5ea7020`. [Source](https://github.com/patleeman/neon-pilot/blob/49aa6d404a1ccc4473b79c7b90d55a77f5ea7020/packages/core/src/mcp-oauth.ts).
Member: `packages/core/src/mcp-oauth.ts`. SHA-256: `d882b30876a63a16959f04e11569faf5ab9d89ad330d7ea3561bed8822ca376a`.
Recorded result: B; AST complete; Semgrep complete.

- `getMcpServerUrlHash`, line 795; function similarity 0.818565; normalized SHA-256 `fa3298fa04bc8e03b0980f46f1ab4ee11e7bb8d2e8700925ff627c2a5505b904`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

### abluva/mcp-remote

Commit: `9cd1ca1a81d402539825db7f72fc1571502027c1`. [Source](https://github.com/abluva/mcp-remote/blob/9cd1ca1a81d402539825db7f72fc1571502027c1/src/lib/utils.ts).
Member: `src/lib/utils.ts`. SHA-256: `6e99b27825c6efaba4a2417295b46b3286ef3b817360e3339a4a55ab1e4e6e8a`.
Recorded result: B; AST complete; Semgrep complete.

- `getServerUrlHash`, line 2209; function similarity 0.92437; normalized SHA-256 `7536b518b2e9cd938fa29c92168a2785ca7f48ead23b0801c5b4c1f4c892f252`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

### ekizilkaya/IntelAgent

Commit: `da0e6cea742d2a4364dab0dd4fbe7fca9ba7ec7c`. [Source](https://github.com/ekizilkaya/IntelAgent/blob/da0e6cea742d2a4364dab0dd4fbe7fca9ba7ec7c/mcp-remote-utils.ts).
Member: `mcp-remote-utils.ts`. SHA-256: `ba76e708518b0b47ad93cef72d476dade919d5bb35ebfb31d885f6afb690d678`.
Recorded result: B; AST complete; Semgrep complete.

- `getServerUrlHash`, line 994; function similarity 0.92437; normalized SHA-256 `7536b518b2e9cd938fa29c92168a2785ca7f48ead23b0801c5b4c1f4c892f252`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

### moneta/mcp-remote

Commit: `cef0560e5476a1a1f2b0a296240a0b2192e51f99`. [Source](https://github.com/moneta/mcp-remote/blob/cef0560e5476a1a1f2b0a296240a0b2192e51f99/src/lib/utils.ts).
Member: `src/lib/utils.ts`. SHA-256: `9e519820d7857e2b4fb4737cdcfd3ccdf5ce99baacb922a20ba68515ba7231b3`.
Recorded result: B; AST complete; Semgrep complete.

- `getServerUrlHash`, line 1098; function similarity 0.92437; normalized SHA-256 `7536b518b2e9cd938fa29c92168a2785ca7f48ead23b0801c5b4c1f4c892f252`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

### michalrokita/MCP-Passport

Commit: `8dfebb575fb2832238675f3b3e149e7eedc60469`. [Source](https://github.com/michalrokita/MCP-Passport/blob/8dfebb575fb2832238675f3b3e149e7eedc60469/src/main/mcpUrlHash.ts).
Member: `src/main/mcpUrlHash.ts`. SHA-256: `21388e22578908d2b18444d51e7737cd6035a3fb63579b42b1c45fbce27ca0f3`.
Recorded result: B; AST complete; Semgrep complete.

- `mcpUrlHash`, line 14; function similarity 0.591195; normalized SHA-256 `7c0f6c24193d61ec352ff41eb56e599238e2136e991c896210ec4b46dd6b15e5`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

### grupoultra/up-mcp-bridge

Commit: `acc515b94333334ab3408e250832755a311a6d75`. [Source](https://github.com/grupoultra/up-mcp-bridge/blob/acc515b94333334ab3408e250832755a311a6d75/src/lib/utils.ts).
Member: `src/lib/utils.ts`. SHA-256: `01b60c2040d314adea2435bdcc42fd1350053a1b123bb200c7fc56183a9de4c0`.
Recorded result: B; AST complete; Semgrep complete.

- `getServerUrlHash`, line 2041; function similarity 0.92437; normalized SHA-256 `7536b518b2e9cd938fa29c92168a2785ca7f48ead23b0801c5b4c1f4c892f252`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

### NerdOutInc/recall-plugins

Commit: `cc2085f502c6ce016a517c463353e1a2410f14ad`. [Source](https://github.com/NerdOutInc/recall-plugins/blob/cc2085f502c6ce016a517c463353e1a2410f14ad/plugins/recall/bridge/build/vendor/mcp-remote/src/lib/utils.ts).
Member: `plugins/recall/bridge/build/vendor/mcp-remote/src/lib/utils.ts`. SHA-256: `11331e1e33f88bccd3aea04c103aaab2cb4e56444156210126a83c00b9331e33`.
Recorded result: B; AST complete; Semgrep complete.

- `getServerUrlHash`, line 1071; function similarity 0.92437; normalized SHA-256 `7536b518b2e9cd938fa29c92168a2785ca7f48ead23b0801c5b4c1f4c892f252`.

This supports a shared namespace helper or selected structural relationship. Full project ancestry, complete discovery behavior and product exposure remain unestablished.

## Further comparison cohorts

| Cohort | Artifacts | Source instances | A | B | C | UNRESOLVED |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Calibration | 10 | 3033 | 0 | 0 | 9 | 1 |
| Corporate pilot after targeted review | 33 | 1325 | 0 | 1 | 32 | 0 |
| Marketplace | 20 | 3699 | 0 | 3 | 10 | 7 |
| Total | 63 | 8057 | 0 | 4 | 51 | 8 |

These are 63 distinct pinned artifact identities and 8057 source instances. Zero A results here do not cancel the separate npm/Git observations. B can retain coverage gaps; C applies only to the selected indicators in the processed scope. The ledger retains all 8057 file instances, filtered files and incomplete results.

### ms-azuretools.vscode-azureresourcegroups 0.13.2

Archive SHA-256: `82a089f7919233cbdba592f2d8f4af99e6b7f5f877a6ed20adb1e54a820506b4`.

Category B with incomplete full-bundle coverage.

Targeted source review identified server-side metadata and challenge-response helpers, including `buildWwwAuthenticateHeader`. Four slices contain no direct outbound network call; the full bundle retains its parse gap.

### anthropic.claude-code 2.1.89

Archive SHA-256: `f46012808ee27e1c408f82fa5dfd4c1b21ac885702e4d65bd880828cb51fe50c`.

Category B with incomplete full-bundle coverage.

Member: `extension/resources/claude-code/cli.js`. SHA-256: `4542e9127b2ca4896c5c1bfa72994bb3e412964e9e96767da0835515826fa37f`.

- `uB1`: reference `pkceChallenge`; similarity 0.8625; normalized SHA-256 `27d3940b33b8348b8fea44907dffa638ae9e5dba84d00c003c049c91ce1e11c5`.

### augment.vscode-augment 0.904.1

Archive SHA-256: `f8bc24e3fc434487799220937b41cd4c2f8a50d3070c67de422d7f27b5a9d6ab`.

Category B with incomplete full-bundle coverage.

Member: `extension/out/extension.js`. SHA-256: `9050779577b3641d3b02b280ed55401d69ef64d6b08ecb6c0c661dd6270a9670`.

- `sF`: reference `extractWWWAuthenticateParams`; similarity 0.807909604519774; normalized SHA-256 `1eb46474f5a1687367b994c5b23871253242bf865246622836c00c072219e0b3`.

Member: `extension/out/migration-engine/auggie-v2.mjs.d/extensions/mcp/index.js`. SHA-256: `3fb364c6e4fd96b7cb36c423d869980d2af69238aa9dc4868c6cfe36bb2d996e`.

- `gY`: reference `pkceChallenge`; similarity 0.8625; normalized SHA-256 `27d3940b33b8348b8fea44907dffa638ae9e5dba84d00c003c049c91ce1e11c5`.

### moonshot-ai.kimi-code 0.8.1

Archive SHA-256: `bc4a21d0818d9636dd31a54b36b3cd0d2988e8e862b4999db0549b9e1780c3c8`.

Category B with incomplete full-bundle coverage.

Member: `extension/dist/extension.js`. SHA-256: `94985f147b84ed6b1eefc996736423cb4978348b6fe2085d212aa14d059e47b2`.

- `extractWWWAuthenticateParams`: reference `extractWWWAuthenticateParams`; similarity 0.8659217877094972; normalized SHA-256 `1dc1229d32fa6fe9514f79d9d94ade6c3ce40743a08372c534b3d81d83361f11`.
- `startAuthorization`: reference `startAuthorization`; similarity 0.8819875776397516; normalized SHA-256 `3b6ddfd96d57949f0559fe131d30bc80b144c01122c659652ad784a4f30466e8`.

## Repository metadata

Two saved Git metadata records identify forks of `punkpeye/mcp-remote`:

- `Ashesh3/mcp-remote-entra` at `4d7b9d75c43e7ed435e868d0f9f002ba61da0a0c`.
- `explorium-ai/mcp-remote` at `6eeeeceab1d567787aa1af22d42a927f519d5034`.

These metadata observations support the provenance view and add no npm results. No alias relationship is inferred from a matching name or function.

[Evidence accounting](EVIDENCE.md) · [Full ledger](data/code-distribution.json) · [Recorded classifications](data/ecosystem-lineage.json)
