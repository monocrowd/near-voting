near-voting Smart Contract
==================

API
===========
1. view_candidates
   - near view $CONTRACT_NAME view_candidates
2. add_candidate
   - near call $CONTRACT_NAME add_candidate '{"candidate_id": "Tom"}' --accountId $CONTRACT_NAME
3. vote
   - near call $CONTRACT_NAME vote '{"candidate_id": "Tom"}' --accountId $VOTER_ACCOUNT_ID
