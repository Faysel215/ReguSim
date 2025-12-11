import { NodeEntity, LinkEntity, SimulationConfig, TimeStepData } from '../types';

// Helper to generate initial random network
export const generateNetwork = (count: number): { nodes: NodeEntity[], links: LinkEntity[] } => {
  const nodes: NodeEntity[] = [];
  const links: LinkEntity[] = [];

  for (let i = 0; i < count; i++) {
    const typeRandom = Math.random();
    let type: 'BANK' | 'SUKUK_ISSUER' | 'MARKET_MAKER' = 'BANK';
    if (typeRandom > 0.8) type = 'SUKUK_ISSUER';
    else if (typeRandom > 0.95) type = 'MARKET_MAKER';

    nodes.push({
      id: `node-${i}`,
      type,
      health: 100,
      exposure: Math.random() * 100,
      x: Math.random() * 400,
      y: Math.random() * 300,
    });
  }

  // Create random connections
  nodes.forEach(source => {
    const numLinks = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numLinks; j++) {
      const target = nodes[Math.floor(Math.random() * nodes.length)];
      if (source.id !== target.id) {
        links.push({
          source: source.id,
          target: target.id,
          strength: Math.random()
        });
      }
    }
  });

  return { nodes, links };
};

export const stepSimulation = (
  currentNodes: NodeEntity[],
  currentData: TimeStepData,
  config: SimulationConfig,
  stepCount: number
): { nextNodes: NodeEntity[], nextData: TimeStepData } => {
  const nextNodes = currentNodes.map(node => ({ ...node }));
  
  // Simulation Physics
  // 1. Panic Spread
  const panicFactor = config.investorPanicSensitivity / 50; 
  const riskTrigger = 100 - config.tangibilityRatio; // Higher tangibility = harder to trigger risk initially

  let totalHealth = 0;
  let defaultCount = 0;

  nextNodes.forEach(node => {
    // Basic decay based on exposure if shock is high
    let decay = 0;

    // Trigger initial shock at step 5
    if (stepCount === 5) {
       if (node.type === 'SUKUK_ISSUER' && Math.random() > 0.5) {
         node.health -= 50; // Immediate hit
       }
    }

    if (stepCount > 5) {
        // Natural recovery if liquidity is high
        if (config.marketLiquidity > 60) {
            decay -= 0.5; // Healing
        }
        
        // Panic decay
        if (currentData.systemicRisk > 50) {
            decay += (config.investorPanicSensitivity / 20);
        }
    }
    
    // Contagion from neighbors (Simplified logic: find links where I am source or target)
    // For performance in this mock, we approximate neighbor influence randomly weighted by global risk
    if (currentData.systemicRisk > riskTrigger) {
        decay += Math.random() * 2;
    }

    node.health = Math.max(0, Math.min(100, node.health - decay));
    if (node.health <= 0) defaultCount++;
    totalHealth += node.health;
  });

  const avgHealth = totalHealth / nextNodes.length;
  const systemicRisk = 100 - avgHealth;

  // Calculate Market Data
  const prevLiquidity = currentData.liquidity;
  let nextLiquidity = prevLiquidity;
  
  if (systemicRisk > 40) nextLiquidity -= 1;
  else if (systemicRisk < 20 && nextLiquidity < 100) nextLiquidity += 0.5;

  // Sukuk Index reflects the inverse of risk, modulated by liquidity
  const sukukIndex = Math.max(10, 100 - (systemicRisk * 0.8) - ((100 - nextLiquidity) * 0.2));

  return {
    nextNodes,
    nextData: {
      time: currentData.time + 1,
      sukukIndex,
      systemicRisk,
      liquidity: Math.max(0, nextLiquidity),
      defaults: defaultCount
    }
  };
};