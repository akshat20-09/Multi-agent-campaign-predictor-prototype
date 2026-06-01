import { useEffect, useState } from 'react'
import '../styles/ProcessingScreen.css'

function ProcessingScreen({ campaignName }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    'Analyzing consumer reactions...',
    'Evaluating marketing quality...',
    'Running skeptical analysis...',
    'Generating final insights...',
  ]

  useEffect(() => {
    // Cycle through steps while processing
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="processing-screen">
      <div className="processing-container">
        <div className="processing-content">
          <h2>Analyzing Campaign</h2>
          {campaignName && <p className="campaign-title">{campaignName}</p>}

          <div className="steps-container">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`step ${index === currentStep ? 'active' : ''} ${
                  index < currentStep ? 'completed' : ''
                }`}
              >
                <div className="step-indicator">
                  {index < currentStep ? (
                    <span className="checkmark">✓</span>
                  ) : index === currentStep ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <span className="step-number">{index + 1}</span>
                  )}
                </div>
                <div className="step-text">
                  <p>{step}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="processing-info">
            <p>This may take 1-5 minutes depending on your hardware.</p>
            <p className="info-note">Running local AI inference with Qwen2.5...</p>
          </div>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default ProcessingScreen
