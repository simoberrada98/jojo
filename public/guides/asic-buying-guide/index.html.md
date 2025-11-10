# ASIC Miner Buying Guide
> A practical framework for selecting miners, modelling cash flow, and preparing deployments.

## Phase 1: Evaluate Miner Fundamentals
| Factor | Target guardrail | Why it matters |
| --- | --- | --- |
| Hashrate-to-Watt ratio | >= 30 GH/W (SHA-256) or >= 8 GH/W (Scrypt) | Higher ratios reduce energy and cooling costs while keeping hashrate stable |
| All-in power cost | <= $0.07/kWh after credits or hosting | Use blended rate including demand, rack, and redundancy premiums |
| Break-even horizon | 12-18 months with 15% sensitivity | Model downside case with difficulty and hashprice compression |
| Resale floor | >= 35% of landed price after 24 months | Track secondary markets for backup liquidity |

## Phase 2: Model Pricing & Cash Flow
- Include duties, freight, rack fees, uptime SLAs, and cost of capital
- Use conservative hashprice assumptions and energy escalators in contracts
- Run base, stress, upside scenarios with difficulty curves
- Allocate 5-8% of CapEx to spares and hot-swappable PSUs/controllers
- Compare hosting offers; require uptime credits and transparent power pass-through

## Phase 3: Deployment Readiness Checklist
| Milestone | Accountable owners | Evidence required |
| --- | --- | --- |
| Facility power and cooling verification | Facilities + Electrical engineer | Load test report, breaker schedule, airflow modelling |
| Network segmentation & monitoring | Security + DevOps | VLAN, firewall rules, uptime dashboards |
| Warranty & RMA process | Procurement + Support | Serial tracking in CMDB; RMA SLA acknowledgement from manufacturer |
| Spare parts & onsite spares | Operations | Fan, PSU, controller inventory with lead times |

