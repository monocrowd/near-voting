use near_sdk::collections::{LookupSet, UnorderedMap};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    AccountId,
};
use near_sdk::{env, near_bindgen, setup_alloc};
use std::collections::HashMap;

setup_alloc!();

type CandidateId = String;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Candidate {
    candidate_id: CandidateId,
    metadata: Option<HashMap<String, String>>,
    votes: u128,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Voting {
    candidates: UnorderedMap<CandidateId, Candidate>,

    // store who already voted
    voters: LookupSet<AccountId>,
}

impl Default for Voting {
    fn default() -> Self {
        Self {
            candidates: UnorderedMap::new(b"c".to_vec()),
            voters: LookupSet::new(b"v".to_vec()),
        }
    }
}

#[near_bindgen]
impl Voting {
    pub fn add_candidate(
        &mut self,
        candidate_id: CandidateId,
        metadata: Option<HashMap<String, String>>,
    ) {
        if self.candidates.get(&candidate_id).is_some() {
            env::panic(format!("candidate {} already exists", candidate_id).as_bytes());
        }
        let candidate = Candidate {
            candidate_id: candidate_id.clone(),
            metadata,
            votes: 0,
        };
        self.candidates.insert(&candidate_id, &candidate);
    }

    pub fn view_candidates(&self) -> Vec<Candidate> {
        self.candidates.values().collect()
    }

    pub fn vote(&mut self, candidate_id: CandidateId) {
        let voter = env::predecessor_account_id();
        if self.voters.contains(&voter) {
            env::panic("you can only vote once".as_bytes());
        }
        match self.candidates.get(&candidate_id) {
            Some(mut candidate) => {
                candidate.votes += 1;
                self.candidates.insert(&candidate_id, &candidate);
                self.voters.insert(&voter);
            }
            None => env::panic(format!("candidate {} not exists", candidate_id).as_bytes()),
        }
    }
}
