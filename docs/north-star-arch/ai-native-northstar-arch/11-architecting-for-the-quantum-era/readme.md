---
id: id-nsa-11
sidebar_position: 11
slug: /ai-native-north-star-architecture/architecting-for-the-quantum-era
sidebar_custom_props:
    category_index: []
title: Architecting for the quantum era
description: "How SAP's AI-native North Star architecture prepares for the quantum era with QPU coprocessors, cloud-native APIs, and scoped analytical use."
keywords:
    - quantum computing
    - quantum processing unit
    - quantum optimization
    - quantum simulation
    - cloud-native quantum apis
    - hybrid classical quantum
    - probabilistic inference
    - postquantum cryptography
    - quantum-ready enterprise
    - ai-native north star architecture
    - sap
    - business ai platform
sidebar_label: 11. Architecting for the Quantum Era
image: img/ac-soc-med.png
tags:
    - ai-native-north-star
hide_table_of_contents: false
hide_title: false
toc_min_heading_level: 2
toc_max_heading_level: 4
draft: false
unlisted: false
pagination_prev: north-star-arch/ai-native-northstar-arch/customer-specific-development-services/id-nsa-10
pagination_next: north-star-arch/ai-native-northstar-arch/closing-note/id-nsa-12
contributors:
discussion:
last_update:
    author: SAP
    date: 2026-10-23
---

The AI-native North Star architecture prepares SAP for quantum computing, where superposition and entanglement enable major acceleration in optimization, simulation, and machine learning. As we approach the early fault-tolerant quantum era over the coming months, preparing now helps ensure that SAP can adopt quantum capabilities once enterprise-grade hardware matures in the near future.

import quantumImg from './images/quantum.png';

### How the AI-native North Star architecture integrates quantum computing

Quantum computing extends classical and AI-native systems by adding computational richness and depth for specialized problem classes. AI contributes cognitive reasoning, while quantum systems contribute amplitude- and phase-based computation, creating a continuum of intelligent and probabilistic processing that shapes the next phase of enterprise architecture.
 
Architectural principles for quantum integration include: 
- **Quantum processing unit (QPU)**: QPUs operate as mathematical coprocessors that applications invoke for complex computational decision tasks and return classical outputs that flow back into deterministic workflows.
- **Cloud-native integration**: QPUs are accessed as secure cloud services through standardized APIs that abstract vendor differences and support scalable and interoperable consumption. Applications that use mathematical optimization can prepare today by using the SAP BTP service for mathematical optimization, which offers a path to quantum-enabled optimization.
- **Scope for analytical and compute-only use**: Quantum execution stays within planning, forecasting, and optimization because the no-cloning theorem prevents reliable replication of quantum states needed for transactional operations.

#### Example: Quantum Machine Learning

QPUs can be used for both training and inference. It starts with selecting the correct quantum model, which is trained on a QPU. The trained parameters are then stored classically on SAP BTP. For inference, the QML model with trained parameters is loaded in the form of a quantum circuit on the QPU and executed.

### The path forward: A quantum-ready enterprise

<div className="nsa-float-image" style={{ float: 'right', marginLeft: '20px', width: '30%', maxWidth: '320px' }}>

<a href="https://www.youtube.com/watch?v=_GyU1gSp0ZE" target="_blank" rel="noopener noreferrer">
<img src={quantumImg} alt="quantum" className="no-zoom" />
</a>

</div>

<p style={{ textAlign: 'left' }}>

By applying these principles, the AI-native North Star architecture establishes a hybrid model where classical determinism, AI-enhanced cognition, and quantum probability work together within a trusted enterprise foundation. This approach supports postquantum cryptography and prepares SAP for a secure and governed quantum-enabled future.

</p>

<div style={{ clear: 'both' }}></div>