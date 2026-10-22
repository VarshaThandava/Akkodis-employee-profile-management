/**
 * Reusable card wrapper with optional title.
 * @param {Object} props
 * @param {string} [props.title] - Card header title
 * @param {string} [props.className] - Additional class for the card
 * @param {React.ReactNode} props.children
 */
function Card({ title, className = '', children }) {
  return (
    <div className={'card ' + className}>
      {title && (
        <div className="card-header">
          <h2 className="card-title mb-0">{title}</h2>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  )
}

export default Card
