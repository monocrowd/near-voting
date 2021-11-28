import 'regenerator-runtime/runtime'
import React from 'react'
import { login, logout } from './utils'
import './global.css'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  // use React Hooks to store greeting in component state
  const [candidates, set_candidates] = React.useState([])

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.view_candidates({ accountId: window.accountId })
          .then(result => {
            set_candidates(result)
          })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1>Welcome to NEARVEMBER Challenge 8!</h1>
        <p>
          Go ahead and click the button below to try it out:
        </p>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label
            htmlFor="greeting"
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          > It is time to vote
          </label>
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          {window.accountId}!
        </h1>
        <CandidateList candidates={candidates} />
        <form onSubmit={async event => {
          event.preventDefault()

          // // get elements from the form using their id attribute
          const { fieldset, newCandidateInput } = event.target.elements

          // // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
          const newCandidate = newCandidateInput.value

          // // disable the form while the value gets updated on-chain
          fieldset.disabled = true

          try {
            // make an update call to the smart contract
            await window.contract.add_candidate({
              // pass the value that the user entered in the greeting field
              candidate_id: newCandidate
            })
          } catch (e) {
            alert(e)
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
            window.contract.view_candidates({ accountId: window.accountId })
            .then(result => {
              set_candidates(result)
            })            
          }
        }}>
          <fieldset id="fieldset">
            <label
              htmlFor="greeting"
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
              Nominate new candidate
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete="off"
                defaultValue="someone"
                placeholder="candidate"
                id="newCandidateInput"
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Submit
              </button>
            </div>
          </fieldset>
        </form>
      </main>
    </>
  )
}

function CandidateList({ candidates }) {
  const [buttonDisabled, setButtonDisabled] = React.useState(false)

  const onClick = async (id) => {
    console.log(id)
    setButtonDisabled(true)
    try {
      // make an update call to the smart contract
      await window.contract.vote({
        // pass the value that the user entered in the greeting field
        candidate_id: id
      })
    } catch (e) {
      alert(e)
    } finally {
      // re-enable the form, whether the call succeeded or failed
      setButtonDisabled(false)
      window.contract.view_candidates({ accountId: window.accountId })
      .then(result => {
        set_candidates(result)
      })      
    }
  }

  return (
    <div>
      <h2>Candidates</h2>
      <ul>{candidates.map(c => (
        <li style={{ display: 'flex' }} key={c.candidate_id}>
          <div style={{ display: 'flex' }}>
            <button
              style={{ borderRadius: '5px 5px 5px 5px' }}
              onClick={() => onClick(c.candidate_id)}
              disabled={buttonDisabled}
            >
              Vote
            </button>            
            <input
              autoComplete="off"
              value={c.candidate_id}
              readOnly={true}
              style={{ flex: 1 }}
            />
            <input
              autoComplete="off"
              value={`${c.votes} votes`}
              readOnly={true}
              style={{ flex: 1 }}
            />
          </div>
        </li>
      ))}</ul>
    </div>
  )
}
