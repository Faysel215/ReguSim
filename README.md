# ReguSim: Systemic Contagion Sandbox

**Version:** 2.0.4-QABM (Beta)

## Overview

**ReguSim** is a macroeconomic simulator designed for Central Banks and Regulatory Bodies (e.g., AAOIFI) to stress-test the Islamic banking sector. It utilizes a **Quantum Agent-Based Model (Q-ABM)** approach to simulate interactions between autonomous agents—Banks, Sukuk Issuers, and Market Makers—within a financial network.

The platform allows regulators to visualize how specific shocks, such as a **Tangibility Ratio Breach**, can trigger systemic contagion, liquidity freeze-ups, and fire sales across the market. It provides a risk-free virtual environment to test policy interventions before implementation.

## Key Features

### 1. Advanced Simulation Engine
- **Agent Interactivity:** Simulates ~60 autonomous nodes with dynamic health and exposure levels.
- **Contagion Physics:** Models financial contagion spreading through network links based on counterparty risk and market panic.
- **Dynamic Shocks:** Trigger events like *Tangibility Breaches*, *Major Bank Defaults*, or *Oil Price Collapses*.

### 2. Real-Time Visualization
- **Network Map:** Interactive graph showing the health status of nodes (Healthy, Stressed, Defaulted) and the spread of risk.
- **Market Charts:** Live tracking of key indicators:
  - **Sukuk Index:** Price performance of the asset class.
  - **Systemic Risk:** Aggregate fragility of the network.
  - **Liquidity:** Market depth and trading ease.

### 3. AI-Powered Regulatory Insights
Integrated with **Google Gemini 2.5 Flash** to act as an automated policy analyst.
- **Pre-Simulation Brief:** Generates theoretical risk assessments based on selected configuration parameters before the test begins.
- **Post-Mortem Policy Report:** Analyzes simulation data (defaults, market drop, risk velocity) to generate an executive summary, risk assessment, and concrete policy recommendations.

## Configuration Parameters

- **Tangibility Ratio (%):** The minimum required ratio of tangible assets backing the Sukuk. Lower values increase the risk of Shariah-compliance failure.
- **Market Liquidity:** Determines how easily assets can be sold to absorb shocks.
- **Investor Panic Sensitivity:** Controls how aggressively agents react to market downturns (herding behavior).

## Tech Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS
- **Visualization:** Recharts (Charts), Custom SVG (Network Graph)
- **AI Integration:** Google GenAI SDK (`gemini-2.5-flash`)
- **Icons:** Lucide React

## Usage

1. **Configure Scenarios:** Use the sidebar to set the Tangibility Ratio and selecting a Shock Scenario.
2. **Start Simulation:** Click "Start Test" to initialize the agents and begin the time-stepped simulation.
3. **Observe:** Watch the Network Map for red nodes (Defaults) and the Chart for spiking Systemic Risk.
4. **Analyze:** Once the simulation completes (100 steps), read the AI-generated "Post-Mortem Policy Report" for actionable insights.

## Disclaimer

This application is a simulation tool for educational and testing purposes. It simplifies complex macroeconomic factors and should not be used as the sole basis for real-world financial decisions.