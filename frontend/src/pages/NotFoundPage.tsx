import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="simple-state-page">
      <span className="eyebrow">404 / not found</span>
      <h1>That page has not entered the map yet.</h1>
      <p>The route may arrive in a later stage. For now, return to the introduction and choose your path.</p>
      <Link className="button" to="/">Back to Ventureline <span>↗</span></Link>
    </main>
  )
}
