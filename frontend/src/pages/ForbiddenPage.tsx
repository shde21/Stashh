import { Link } from 'react-router-dom'

export default function ForbiddenPage() {
  return (
    <main className="simple-state-page">
      <span className="eyebrow">403 / wrong workspace</span>
      <h1>This door is not part of your role.</h1>
      <p>Ventureline keeps each workspace focused. Use your account area or return to the public introduction.</p>
      <div className="simple-state-actions"><Link className="button" to="/app">Go to my workspace <span>↗</span></Link><Link className="quiet-link" to="/">Back to home</Link></div>
    </main>
  )
}
