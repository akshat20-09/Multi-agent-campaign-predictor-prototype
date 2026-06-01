import '../styles/ResultsScreen.css'

function ResultsScreen({ results, onReset }) {
  const getScoreClass = (score) => {
    if (score >= 7) return 'high'
    if (score >= 5) return 'medium'
    return 'low'
  }

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent'
    if (score >= 6) return 'Good'
    if (score >= 4) return 'Fair'
    return 'Needs Work'
  }

  return (
    <div className="results-screen">
      <div className="results-container">
        <div className="results-header">
          <h1>Analysis Results</h1>
          <p className="campaign-name">{results.campaign_name}</p>
        </div>

        {/* Overall Score */}
        <div className="score-section glass-card">
          <div className="score-content">
            <div className="score-left">
              <h2>Overall Score</h2>
              <p className="score-description">
                Based on consumer, marketing, and skeptical perspectives
              </p>
            </div>
            <div className={`score-badge ${getScoreClass(results.overall_score)}`}>
              {results.overall_score.toFixed(1)}
            </div>
          </div>
          <p className="score-label">{getScoreLabel(results.overall_score)}</p>
        </div>

        {/* Insights Grid */}
        <div className="insights-grid">
          {/* Consumer Insights */}
          <div className="insight-card glass-card">
            <div className="insight-header">
              <h3>👥 Consumer Perspective</h3>
            </div>
            <p className="insight-text">{results.consumer_insights}</p>
          </div>

          {/* Marketing Insights */}
          <div className="insight-card glass-card">
            <div className="insight-header">
              <h3>📊 Marketing Perspective</h3>
            </div>
            <p className="insight-text">{results.marketing_insights}</p>
          </div>

          {/* Skeptic Insights */}
          <div className="insight-card glass-card">
            <div className="insight-header">
              <h3>⚠️ Critical Perspective</h3>
            </div>
            <p className="insight-text">{results.skeptic_insights}</p>
          </div>
        </div>

        {/* Final Recommendation */}
        <div className="recommendation-section glass-card">
          <h2>Final Recommendation</h2>
          <div className="recommendation-box">
            <p>{results.final_recommendation}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={onReset}>
            Analyze Another Campaign
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsScreen
