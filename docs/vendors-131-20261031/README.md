# What 131 MCP vendors advertise for client registration

Researcher: Alex Gercog (playb0t). Read on 31 October 2026. Companion table to the article [Nobody Calls Pan Am: The AI Industry's Self-Printed Badge Problem](https://www.linkedin.com/pulse/nobody-calls-pan-am-ai-industrys-self-printed-badge-problem-gercog-vmhxc/) (3 November 2026). The data is also in [vendors-131.csv](vendors-131.csv) (columns: `tranco_rank`, `domain`, `advertised_registration`, `verifiable_client_id_advertised`). Text and data are licensed under [CC BY 4.0](../../LICENSE).

Method, in short: a public directory of remote MCP servers ([MCPBundles](https://www.mcpbundles.com/), open API) gave the servers that may need a sign-in; the vendor domain came from each server's registry name; the list was cut to domains in the top 10,000 of the [Tranco list](https://tranco-list.eu/) (list 746VX), three hosting platforms and one university lab dropped. Each server got one `initialize` request without a token, then its public discovery documents were read: the protected-resource metadata (from the `WWW-Authenticate` challenge or the `/.well-known/oauth-protected-resource` path) and the authorization server metadata (`oauth-authorization-server`, then `openid-configuration`). A `registration_endpoint` counts as advertising Dynamic Client Registration (DCR); `client_id_metadata_document_supported: true` counts as advertising Client ID Metadata Documents (CIMD). No registration was attempted, so what a server actually lets through can be stricter than what it advertises.

Of 150 vendors, 139 answered normally, 7 refused with a 403, 4 did not get that far. Of the 139, 5 accepted the request without a sign-in and 3 published no login metadata where this read looked. This table lists the remaining 131.

| Advertised | Vendors |
|---|---:|
| DCR (any) | 122 |
| CIMD (any) | 29 |
| DCR only | 95 |
| DCR and CIMD | 27 |
| CIMD only | 2 |
| Neither (pre-registration only) | 7 |

Limits: one read, one day, from one network location; only the first authorization server listed in a resource document was read; a vendor with several servers is one row, classified by the strongest signal among its servers; CIMD was counted only on a literal `true`.

| Tranco rank | Vendor domain | Advertised registration | Verifiable client ID advertised (CIMD) |
|---:|---|---|---|
| 61 | adobe.com | DCR only | no |
| 87 | vimeo.com | DCR only | no |
| 99 | wordpress.com | DCR only | no |
| 131 | adobe.io | DCR only | no |
| 171 | shopify.com | CIMD only | yes |
| 265 | linktr.ee | DCR and CIMD | yes |
| 284 | datadoghq.com | DCR only | no |
| 385 | bloomberg.com | DCR only | no |
| 410 | calendly.com | DCR only | no |
| 567 | klaviyo.com | DCR and CIMD | yes |
| 615 | wix.com | DCR only | no |
| 649 | jotform.com | DCR only | no |
| 659 | stackadapt.com | DCR only | no |
| 688 | surveymonkey.com | DCR and CIMD | yes |
| 759 | conviva.com | DCR only | no |
| 765 | deepl.com | DCR and CIMD | yes |
| 775 | mailchimp.com | DCR only | no |
| 796 | zoho.com | DCR only | no |
| 826 | mixpanel.com | DCR only | no |
| 855 | pendo.io | DCR and CIMD | yes |
| 905 | figma.com | DCR only | no |
| 1149 | typeform.com | DCR and CIMD | yes |
| 1158 | datadome.co | DCR and CIMD | yes |
| 1242 | intercom.com | DCR only | no |
| 1442 | rackspace.com | DCR only | no |
| 1886 | moengage.com | DCR only | no |
| 1924 | meetup.com | DCR only | no |
| 1926 | udemy.com | DCR only | no |
| 1940 | gmx.net | DCR and CIMD | yes |
| 1941 | oreilly.com | DCR only | no |
| 1977 | strava.com | DCR only | no |
| 2107 | eskimi.com | DCR only | no |
| 2142 | miro.com | DCR only | no |
| 2165 | expedia.com | neither (pre-registration only) | no |
| 2246 | doordash.com | neither (pre-registration only) | no |
| 2259 | semrush.com | DCR only | no |
| 2266 | evernote.com | DCR only | no |
| 2267 | grafana.com | DCR and CIMD | yes |
| 2296 | web.de | DCR and CIMD | yes |
| 2461 | braze.eu | DCR and CIMD | yes |
| 2480 | egnyte.com | DCR only | no |
| 2515 | instacart.com | neither (pre-registration only) | no |
| 2619 | namepros.com | DCR only | no |
| 2721 | padlet.com | DCR only | no |
| 2780 | webflow.com | DCR only | no |
| 2872 | rudderstack.com | DCR only | no |
| 2890 | clickup.com | DCR only | no |
| 2917 | podbean.com | DCR and CIMD | yes |
| 3032 | lokalise.com | DCR only | no |
| 3087 | brevo.com | DCR only | no |
| 3171 | docusign.com | neither (pre-registration only) | no |
| 3277 | kahoot.it | DCR only | no |
| 3300 | tradingeconomics.com | DCR only | no |
| 3375 | razorpay.com | DCR only | no |
| 3620 | feedly.com | DCR and CIMD | yes |
| 3790 | bitly.com | DCR only | no |
| 3860 | sanity.io | DCR only | no |
| 3904 | feverup.com | DCR only | no |
| 3948 | leadconnectorhq.com | DCR only | no |
| 3950 | gamma.app | DCR only | no |
| 3962 | openrouter.ai | DCR only | no |
| 3981 | g2.com | neither (pre-registration only) | no |
| 4011 | verisoul.ai | DCR only | no |
| 4026 | netlify.com | DCR only | no |
| 4032 | similarweb.com | DCR only | no |
| 4082 | neon.tech | DCR and CIMD | yes |
| 4120 | sketchup.com | DCR only | no |
| 4153 | handelsblatt.com | DCR and CIMD | yes |
| 4172 | rnp.br | DCR only | no |
| 4269 | mailerlite.com | DCR only | no |
| 4298 | growthbook.io | DCR only | no |
| 4357 | buffer.com | DCR only | no |
| 4490 | flipsnack.com | DCR only | no |
| 4519 | greenhouse.io | DCR only | no |
| 4561 | opensea.io | neither (pre-registration only) | no |
| 4646 | zoominfo.com | DCR only | no |
| 4853 | tally.so | DCR only | no |
| 4946 | pcloud.com | DCR and CIMD | yes |
| 5027 | dynadot.com | DCR only | no |
| 5123 | midjourney.com | DCR and CIMD | yes |
| 5124 | aptrinsic.com | DCR only | no |
| 5180 | sprig.com | DCR only | no |
| 5437 | glance.com | DCR only | no |
| 5557 | heroku.com | DCR only | no |
| 5632 | sendsay.ru | DCR only | no |
| 5646 | arkoselabs.com | DCR only | no |
| 5724 | thinkific.com | DCR and CIMD | yes |
| 5747 | pubnub.com | DCR only | no |
| 5772 | beehiiv.com | DCR only | no |
| 5908 | runwayml.com | DCR only | no |
| 5946 | airbridge.io | DCR only | no |
| 5948 | groww.in | DCR only | no |
| 6000 | idc.com | DCR only | no |
| 6066 | tomtom.com | CIMD only | yes |
| 6124 | musixmatch.com | DCR only | no |
| 6142 | basecamp.com | DCR and CIMD | yes |
| 6188 | expo.dev | DCR and CIMD | yes |
| 6192 | dnb.com | neither (pre-registration only) | no |
| 6197 | icons8.com | DCR and CIMD | yes |
| 6224 | muumuu-domain.com | DCR only | no |
| 6231 | genially.com | DCR only | no |
| 6323 | tenjin.com | DCR only | no |
| 6378 | contentful.com | DCR only | no |
| 6529 | bitrix24.tech | DCR only | no |
| 6619 | fantasypros.com | DCR and CIMD | yes |
| 6771 | prismic.io | DCR only | no |
| 6906 | me-qr.com | DCR only | no |
| 6907 | flexport.com | DCR and CIMD | yes |
| 7000 | heapanalytics.com | DCR only | no |
| 7036 | courtlistener.com | DCR and CIMD | yes |
| 7076 | dana.id | DCR only | no |
| 7156 | getredo.com | DCR only | no |
| 7273 | yinzcam.com | DCR only | no |
| 7325 | freshservice.com | DCR only | no |
| 7434 | gitbook.com | DCR only | no |
| 7511 | bling.com.br | DCR only | no |
| 7651 | articulate.com | DCR only | no |
| 7766 | getresponse.com | DCR only | no |
| 8059 | kayzen.io | DCR only | no |
| 8067 | ticktick.com | DCR only | no |
| 8139 | uptimerobot.com | DCR only | no |
| 8160 | openart.ai | DCR only | no |
| 8167 | alchemy.com | DCR only | no |
| 8398 | clarivate.com | DCR and CIMD | yes |
| 8565 | linear.app | DCR and CIMD | yes |
| 8739 | legalzoom.com | DCR only | no |
| 9063 | photoroom.com | DCR and CIMD | yes |
| 9158 | harness.io | DCR only | no |
| 9244 | browserstack.com | DCR only | no |
| 9396 | hyros.com | DCR only | no |
| 9471 | mxtoolbox.com | DCR only | no |
