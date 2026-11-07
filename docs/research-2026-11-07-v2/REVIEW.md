# Independent read-only review

Separate reviewers inspected the CLI/finalization procedure and the OAuth series without editing, network calls or rerunning target tests.

Final CLI records: 63 security PASS, 11 schema stops, 53 Authorization receipts and 63 late HTTP events. All records show two successful server-close callbacks, natural child close, quiet and no pending handlers. The 21 unchanged-v1 attempts preserve 7 completions and 14 assertion stops.

Final OAuth records: 44 PASS, 31 FAIL and 2 INCONCLUSIVE. All 77 have complete finalization and three close callbacks. Every FAIL positively matches a synthetic credential at a forbidden receiver. Policy bindings and source hashes agree. The two earlier-version inconclusive DCR stops remain inconclusive.

The reviewed close-callback and forced-child defects were corrected, negative controls passed, and both fixed cohorts were repeated. Historical stops remain separate. README tables distinguish detector validation, product observations, execution stops and security verdicts.

Exact reviewed source hashes are in procedures/SOURCE-HASHES.json. Original v1 results and official affected ranges were not reclassified. Review does not authorize publication or push.
