import { useState } from 'react'
import InputScreen from './screens/InputScreen'
import ProcessingScreen from './screens/ProcessingScreen'
import ResultsScreen from './screens/ResultsScreen'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('input') // 'input', 'processing', 'results'
  const [campaignData, setCampaignData] = useState(null)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async (formData) => {
    setCampaignData(formData)
    setCurrentScreen('processing')
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Analysis failed')
      }

      const results = await response.json()
      setAnalysisResults(results)
      setCurrentScreen('results')
    } catch (err) {
      setError(err.message)
      setCurrentScreen('input')
    }
  }

  const handleReset = () => {
    setCurrentScreen('input')
    setCampaignData(null)
    setAnalysisResults(null)
    setError(null)
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={handleReset}>Dismiss</button>
        </div>
      )}

      {currentScreen === 'input' && (
        <InputScreen onAnalyze={handleAnalyze} />
      )}

      {currentScreen === 'processing' && (
        <ProcessingScreen campaignName={campaignData?.campaign_name} />
      )}

      {currentScreen === 'results' && (
        <ResultsScreen 
          results={analysisResults} 
          onReset={handleReset}
        />
      )}
    </div>
  )
}

export default App
