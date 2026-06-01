import { useState } from 'react'
import '../styles/InputScreen.css'

function InputScreen({ onAnalyze }) {
  const [formData, setFormData] = useState({
    campaign_name: '',
    target_audience: '',
    budget: '',
    platform: 'facebook',
    ad_copy: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.campaign_name.trim()) {
      alert('Please enter a campaign name')
      return
    }
    if (!formData.target_audience.trim()) {
      alert('Please enter target audience')
      return
    }
    if (!formData.ad_copy.trim()) {
      alert('Please enter ad copy')
      return
    }

    setIsLoading(true)
    try {
      await onAnalyze(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="input-screen">
      <div className="input-container">
        <div className="header">
          <h1>Campaign Predictor</h1>
          <p>AI-powered campaign analysis with local inference</p>
        </div>

        <form onSubmit={handleSubmit} className="campaign-form glass-card">
          <div className="form-group">
            <label htmlFor="campaign_name">Campaign Name</label>
            <input
              id="campaign_name"
              type="text"
              name="campaign_name"
              value={formData.campaign_name}
              onChange={handleChange}
              placeholder="e.g., Summer Sale 2024"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="target_audience">Target Audience</label>
            <input
              id="target_audience"
              type="text"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleChange}
              placeholder="e.g., Women aged 25-35, interested in fitness"
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Budget (Optional)</label>
              <input
                id="budget"
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., $5,000"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="platform">Platform</label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="google">Google Ads</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter/X</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ad_copy">Ad Copy</label>
            <textarea
              id="ad_copy"
              name="ad_copy"
              value={formData.ad_copy}
              onChange={handleChange}
              placeholder="Paste your ad copy here..."
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Analyzing...
              </>
            ) : (
              'Analyze Campaign'
            )}
          </button>
        </form>

        <div className="info-section glass-card">
          <h3>How it works</h3>
          <ul>
            <li><strong>Consumer Agent:</strong> Evaluates emotional appeal and audience resonance</li>
            <li><strong>Marketing Agent:</strong> Assesses targeting, branding, and campaign quality</li>
            <li><strong>Skeptic Agent:</strong> Identifies weaknesses, risks, and realistic concerns</li>
          </ul>
          <p className="info-note">Analysis runs locally using Qwen2.5 model via Ollama. No data is sent to external servers.</p>
        </div>
      </div>
    </div>
  )
}

export default InputScreen
