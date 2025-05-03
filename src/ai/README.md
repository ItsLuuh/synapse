# Neuromorphic Semantic Network (NSN)

A brain-inspired AI implementation that simulates neural networks using digital neurons, artificial boat synapses, and brain sections.

## Overview

The Neuromorphic Semantic Network is a Python-based system that implements a biologically-inspired neural network model. It features:

- Digital Neurons with Leaky Integrate-and-Fire (LIF) dynamics
- Artificial Boat Synapses for connection path planning
- Brain Sections for organizing neurons by domain
- Flask-based REST API for integration with other systems

## Setup

### Prerequisites

- Python 3.7 or higher
- Flask and NumPy libraries

### Installation

1. Install the required Python packages:

```
pip install -r requirements.txt
```

2. Start the NSN server:

```
python nsn_server.py
```

The server will run on http://localhost:5000 by default.

## API Endpoints

### Process Input

```
POST /process
```

Activates a neuron with the specified input current and returns the activation path if a spike is generated.

**Request Body:**
```json
{
  "neuron": "Quantum Mechanics",
  "current": 1.5
}
```

**Response:**
```json
{
  "spike": true,
  "activation_path": ["Cellular Respiration"]
}
```

### Get Neurons

```
GET /neurons
```

Returns all available neurons organized by brain section.

**Response:**
```json
{
  "Physics": ["Quantum Mechanics"],
  "Biology": ["Cellular Respiration"]
}
```

### Add Neuron

```
POST /add_neuron
```

Adds a new neuron to the specified brain section with optional connections.

**Request Body:**
```json
{
  "concept": "Thermodynamics",
  "section": "Physics",
  "connections": [
    {
      "target": "Quantum Mechanics",
      "probability": 0.7,
      "section": "Physics"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "neuron": "Thermodynamics"
}
```

## Integration with Electron

The NSN can be integrated with the Electron application using the provided `nsn-service.js` module in the `services` directory.

## Performance Enhancements

- NumPy for numerical operations
- Path caching for efficient routing
- Connection weight normalization
- Modular brain section organization

## Future Improvements

- GPU acceleration using PyTorch
- Distributed computing for large networks
- Visualization dashboard
- Implementation of Recurring Artificial Memories (RAM)
- Connection to scientific databases for knowledge population