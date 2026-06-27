const { challenge, simModel } = require('../data/lemonadeStand');

const BOOL_TRUE_LABEL = 'A';

function resolveAnswers(answers) {
  const errors = [];
  const get = (id) => {
    const decision = challenge.decisions.find((d) => d.id === id);
    const label = answers[id];
    const valid = decision.options.some((o) => o.label === label);
    if (!valid) {
      errors.push(`Invalid or missing answer for "${id}". Expected one of: ${decision.options.map((o) => o.label).join(', ')}`);
    }
    return label;
  };

  const priceLabel = get('price');
  const inventoryLabel = get('inventory');
  const signLabel = get('sign');
  const adLabel = get('advertise');

  if (errors.length) {
    return { errors };
  }

  return {
    priceLabel,
    inventoryLabel,
    signLabel,
    adLabel,
    price: simModel.priceValue[priceLabel],
    inventory: simModel.inventoryValue[inventoryLabel],
    sign: signLabel === BOOL_TRUE_LABEL,
    advertise: adLabel === BOOL_TRUE_LABEL,
  };
}

function simulate(resolved) {
  const { price, inventory, sign, advertise, priceLabel } = resolved;

  let demandMultiplier = simModel.priceDemandFactor[priceLabel];
  if (sign) demandMultiplier *= 1 + simModel.signBoost;
  if (advertise) demandMultiplier *= 1 + simModel.adBoost;

  const demand = Math.round(simModel.baseTraffic * demandMultiplier);
  const sales = Math.min(demand, inventory);
  const revenue = +(sales * price).toFixed(2);
  const inventoryCost = +(inventory * simModel.costPerCup).toFixed(2);
  const marketingCost = (sign ? simModel.signCost : 0) + (advertise ? simModel.adCost : 0);
  const totalCost = +(inventoryCost + marketingCost).toFixed(2);
  const profit = +(revenue - totalCost).toFixed(2);

  const soldOut = demand > inventory;
  const leftover = Math.max(0, inventory - sales);
  const lostCustomers = Math.max(0, demand - sales);

  return {
    price,
    inventory,
    sign,
    advertise,
    demand,
    sales,
    leftover,
    lostCustomers,
    soldOut,
    revenue,
    inventoryCost,
    marketingCost,
    totalCost,
    profit,
  };
}

function deriveTraits(resolved, sim) {
  const traits = {};

  // Marketing intuition: invested in visibility.
  const marketingMoves = (resolved.sign ? 1 : 0) + (resolved.advertise ? 1 : 0);
  traits.marketingIntuition = marketingMoves === 2 ? 'high' : marketingMoves === 1 ? 'medium' : 'low';

  // Pricing strategy: balanced mid prices vs extremes.
  traits.pricingStrategy = ['B', 'C'].includes(resolved.priceLabel) ? 'balanced' : 'aggressive';

  // Budgeting: how well inventory matched real demand.
  const matchRatio = sim.demand === 0 ? 0 : sim.sales / Math.max(sim.demand, sim.inventory);
  traits.budgeting = matchRatio >= 0.85 ? 'strong' : matchRatio >= 0.6 ? 'fair' : 'loose';

  // Risk appetite: high inventory or premium pricing.
  traits.riskAppetite =
    resolved.inventory >= 100 || resolved.price >= 2 ? 'bold' : 'cautious';

  // Overall outcome rating.
  if (sim.profit >= 80) traits.outcome = 'excellent';
  else if (sim.profit >= 30) traits.outcome = 'solid';
  else if (sim.profit >= 0) traits.outcome = 'breakeven';
  else traits.outcome = 'loss';

  return traits;
}

function buildFeedbackText(studentName, sim, traits) {
  const lines = [];
  const firstName = String(studentName).trim().split(/\s+/)[0] || 'there';

  const opener = {
    excellent: `Outstanding run, ${firstName}!`,
    solid: `Nice work, ${firstName}.`,
    breakeven: `Good effort, ${firstName}.`,
    loss: `Tough day at the stand, ${firstName} — but that's how founders learn.`,
  }[traits.outcome];
  lines.push(opener);

  lines.push(
    `You made $${sim.revenue.toFixed(2)} in revenue, spent $${sim.totalCost.toFixed(2)}, and walked away with $${sim.profit.toFixed(2)} profit by selling ${sim.sales} of ${sim.inventory} cups.`
  );

  if (sim.soldOut) {
    lines.push(
      `You sold out! ${sim.lostCustomers} more customers wanted lemonade but you ran out — next time prepare more inventory or raise your price to capture that demand.`
    );
  } else if (sim.leftover >= sim.inventory * 0.4) {
    lines.push(
      `You had ${sim.leftover} cups left over. Over-preparing ties up money in unsold inventory — match your batch size closer to real demand.`
    );
  } else {
    lines.push(`You matched supply to demand well — only ${sim.leftover} cups went unsold.`);
  }

  if (traits.pricingStrategy === 'balanced') {
    lines.push(`Your pricing was smart — high enough for healthy margins, low enough to keep customers coming.`);
  } else if (sim.price <= 0.5) {
    lines.push(`Your rock-bottom price packed in customers, but thin margins limited your profit. Great entrepreneurs balance volume with margin.`);
  } else {
    lines.push(`Premium pricing boosted your margin per cup but scared off some buyers. Test whether a slightly lower price would lift total profit.`);
  }

  if (traits.marketingIntuition === 'high') {
    lines.push(`Investing in both a sign and flyers paid off by pulling in extra foot traffic — strong marketing instincts.`);
  } else if (traits.marketingIntuition === 'low') {
    lines.push(`You skipped marketing to save cash. A $5 sign or $10 of flyers can often bring in far more than they cost.`);
  } else {
    lines.push(`Your one marketing move helped — try stacking a sign and flyers together next time to compound the effect.`);
  }

  return lines.join(' ');
}

function runChallenge(studentName, answers) {
  const resolved = resolveAnswers(answers);
  if (resolved.errors) {
    return { errors: resolved.errors };
  }

  const simulation = simulate(resolved);
  const traits = deriveTraits(resolved, simulation);
  const feedback = buildFeedbackText(studentName, simulation, traits);

  return {
    resolved,
    simulation,
    traits,
    feedback,
  };
}

module.exports = { runChallenge, simulate, resolveAnswers, deriveTraits, buildFeedbackText };
