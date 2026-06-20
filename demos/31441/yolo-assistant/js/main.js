let trainingState = 'stopped';
let trainingInterval = null;
let currentEpoch = 0;
let totalEpochs = 100;
let trainLoss = 0;
let valLoss = 0;
let map50 = 0;
let map5095 = 0;
let startTime = null;
let trainingConfig = {};

const mockModels = [
    {
        id: 1,
        name: 'YOLOv8n - COCO2017',
        type: 'YOLOv8n',
        trainTime: '2024-01-15 14:30:00',
        dataset: 'COCO 2017',
        map50: 0.582,
        map5095: 0.378,
        accuracy: 0.892,
        recall: 0.823,
        size: 6.2,
        params: '3.2M',
        epochs: 100,
        batchSize: 32,
        layers: [
            { type: 'conv', name: 'Conv', params: '3x3, 16' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '3x3, 32' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 64' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 128' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 256' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '1x1, 80' }
        ],
        trainLossData: [3.2, 2.8, 2.4, 2.1, 1.8, 1.6, 1.4, 1.2, 1.0, 0.85, 0.72, 0.65, 0.58, 0.52, 0.48, 0.45, 0.42, 0.40, 0.38, 0.36],
        valLossData: [3.5, 3.1, 2.7, 2.3, 2.0, 1.7, 1.5, 1.3, 1.1, 0.95, 0.85, 0.78, 0.72, 0.67, 0.63, 0.60, 0.58, 0.56, 0.55, 0.54],
        map50Data: [0.15, 0.22, 0.28, 0.33, 0.38, 0.42, 0.45, 0.48, 0.50, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.575, 0.578, 0.580, 0.581, 0.582],
        map5095Data: [0.08, 0.13, 0.18, 0.22, 0.26, 0.29, 0.32, 0.34, 0.35, 0.36, 0.365, 0.37, 0.372, 0.374, 0.376, 0.377, 0.378, 0.378, 0.378, 0.378]
    },
    {
        id: 2,
        name: 'YOLOv8s - Custom Dataset',
        type: 'YOLOv8s',
        trainTime: '2024-01-14 09:15:00',
        dataset: '自定义数据集',
        map50: 0.723,
        map5095: 0.512,
        accuracy: 0.934,
        recall: 0.887,
        size: 21.5,
        params: '11.2M',
        epochs: 80,
        batchSize: 16,
        layers: [
            { type: 'conv', name: 'Conv', params: '3x3, 32' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '3x3, 64' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 128' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 256' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 512' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '1x1, 80' }
        ],
        trainLossData: [2.8, 2.4, 2.0, 1.7, 1.5, 1.3, 1.1, 0.95, 0.82, 0.72, 0.64, 0.58, 0.53, 0.49, 0.46, 0.43, 0.41, 0.39, 0.38, 0.37],
        valLossData: [3.1, 2.6, 2.2, 1.9, 1.6, 1.4, 1.2, 1.05, 0.92, 0.82, 0.75, 0.69, 0.64, 0.60, 0.57, 0.55, 0.53, 0.52, 0.51, 0.50],
        map50Data: [0.25, 0.35, 0.44, 0.51, 0.57, 0.62, 0.65, 0.67, 0.69, 0.70, 0.708, 0.712, 0.715, 0.718, 0.720, 0.721, 0.722, 0.722, 0.723, 0.723],
        map5095Data: [0.12, 0.19, 0.26, 0.32, 0.37, 0.42, 0.45, 0.47, 0.485, 0.495, 0.50, 0.503, 0.506, 0.508, 0.510, 0.511, 0.512, 0.512, 0.512, 0.512]
    },
    {
        id: 3,
        name: 'YOLOv8m - Pascal VOC',
        type: 'YOLOv8m',
        trainTime: '2024-01-13 16:45:00',
        dataset: 'Pascal VOC',
        map50: 0.785,
        map5095: 0.586,
        accuracy: 0.951,
        recall: 0.912,
        size: 47.2,
        params: '25.9M',
        epochs: 120,
        batchSize: 8,
        layers: [
            { type: 'conv', name: 'Conv', params: '3x3, 48' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '3x3, 96' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 192' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 384' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 576' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '1x1, 80' }
        ],
        trainLossData: [2.5, 2.1, 1.8, 1.5, 1.3, 1.1, 0.95, 0.82, 0.72, 0.64, 0.57, 0.52, 0.48, 0.45, 0.42, 0.40, 0.38, 0.36, 0.35, 0.34],
        valLossData: [2.8, 2.3, 1.9, 1.6, 1.4, 1.2, 1.05, 0.92, 0.82, 0.74, 0.68, 0.63, 0.59, 0.56, 0.54, 0.52, 0.51, 0.50, 0.49, 0.48],
        map50Data: [0.35, 0.46, 0.55, 0.62, 0.67, 0.71, 0.74, 0.76, 0.77, 0.775, 0.78, 0.782, 0.783, 0.784, 0.785, 0.785, 0.785, 0.785, 0.785, 0.785],
        map5095Data: [0.18, 0.27, 0.35, 0.41, 0.46, 0.50, 0.53, 0.55, 0.565, 0.575, 0.58, 0.582, 0.584, 0.585, 0.586, 0.586, 0.586, 0.586, 0.586, 0.586]
    },
    {
        id: 4,
        name: 'YOLOv8l - COCO2017',
        type: 'YOLOv8l',
        trainTime: '2024-01-12 11:20:00',
        dataset: 'COCO 2017',
        map50: 0.812,
        map5095: 0.623,
        accuracy: 0.962,
        recall: 0.928,
        size: 92.4,
        params: '43.7M',
        epochs: 150,
        batchSize: 4,
        layers: [
            { type: 'conv', name: 'Conv', params: '3x3, 64' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '3x3, 128' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 256' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 512' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 512' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '1x1, 80' }
        ],
        trainLossData: [2.3, 1.9, 1.6, 1.3, 1.1, 0.95, 0.83, 0.72, 0.64, 0.57, 0.51, 0.47, 0.44, 0.41, 0.39, 0.37, 0.35, 0.34, 0.33, 0.32],
        valLossData: [2.5, 2.1, 1.7, 1.4, 1.2, 1.0, 0.88, 0.78, 0.70, 0.64, 0.59, 0.55, 0.52, 0.50, 0.48, 0.47, 0.46, 0.45, 0.44, 0.44],
        map50Data: [0.40, 0.52, 0.61, 0.68, 0.73, 0.76, 0.78, 0.795, 0.802, 0.807, 0.810, 0.811, 0.812, 0.812, 0.812, 0.812, 0.812, 0.812, 0.812, 0.812],
        map5095Data: [0.22, 0.32, 0.40, 0.46, 0.51, 0.55, 0.58, 0.60, 0.61, 0.615, 0.62, 0.621, 0.622, 0.623, 0.623, 0.623, 0.623, 0.623, 0.623, 0.623]
    },
    {
        id: 5,
        name: 'YOLOv8x - Custom Dataset',
        type: 'YOLOv8x',
        trainTime: '2024-01-11 08:00:00',
        dataset: '自定义数据集',
        map50: 0.845,
        map5095: 0.668,
        accuracy: 0.971,
        recall: 0.941,
        size: 166.5,
        params: '68.2M',
        epochs: 100,
        batchSize: 2,
        layers: [
            { type: 'conv', name: 'Conv', params: '3x3, 80' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '3x3, 160' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 320' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 640' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 640' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '1x1, 80' }
        ],
        trainLossData: [2.1, 1.7, 1.4, 1.1, 0.95, 0.82, 0.72, 0.64, 0.57, 0.51, 0.46, 0.42, 0.39, 0.37, 0.35, 0.34, 0.32, 0.31, 0.30, 0.29],
        valLossData: [2.3, 1.9, 1.5, 1.2, 1.0, 0.85, 0.75, 0.67, 0.60, 0.55, 0.51, 0.48, 0.45, 0.43, 0.42, 0.41, 0.40, 0.39, 0.39, 0.38],
        map50Data: [0.45, 0.58, 0.68, 0.75, 0.79, 0.82, 0.835, 0.842, 0.845, 0.845, 0.845, 0.845, 0.845, 0.845, 0.845, 0.845, 0.845, 0.845, 0.845, 0.845],
        map5095Data: [0.26, 0.37, 0.46, 0.53, 0.58, 0.62, 0.65, 0.665, 0.668, 0.668, 0.668, 0.668, 0.668, 0.668, 0.668, 0.668, 0.668, 0.668, 0.668, 0.668]
    },
    {
        id: 6,
        name: 'YOLOv8n - Tiny Dataset',
        type: 'YOLOv8n',
        trainTime: '2024-01-10 15:30:00',
        dataset: 'Tiny Dataset',
        map50: 0.456,
        map5095: 0.289,
        accuracy: 0.843,
        recall: 0.762,
        size: 6.2,
        params: '3.2M',
        epochs: 50,
        batchSize: 64,
        layers: [
            { type: 'conv', name: 'Conv', params: '3x3, 16' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '3x3, 32' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 64' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '1x1, 80' }
        ],
        trainLossData: [3.5, 3.0, 2.6, 2.3, 2.0, 1.7, 1.5, 1.3, 1.1, 1.0, 0.9, 0.82, 0.75, 0.69, 0.64, 0.60, 0.57, 0.54, 0.52, 0.50],
        valLossData: [3.8, 3.2, 2.7, 2.3, 2.0, 1.7, 1.5, 1.3, 1.15, 1.02, 0.92, 0.85, 0.79, 0.74, 0.70, 0.67, 0.64, 0.62, 0.60, 0.59],
        map50Data: [0.12, 0.18, 0.24, 0.29, 0.33, 0.37, 0.40, 0.42, 0.435, 0.445, 0.45, 0.452, 0.454, 0.455, 0.456, 0.456, 0.456, 0.456, 0.456, 0.456],
        map5095Data: [0.06, 0.10, 0.14, 0.18, 0.21, 0.24, 0.26, 0.275, 0.285, 0.288, 0.289, 0.289, 0.289, 0.289, 0.289, 0.289, 0.289, 0.289, 0.289, 0.289]
    },
    {
        id: 7,
        name: 'YOLOv8s - COCO2017',
        type: 'YOLOv8s',
        trainTime: '2024-01-09 13:15:00',
        dataset: 'COCO 2017',
        map50: 0.678,
        map5095: 0.456,
        accuracy: 0.912,
        recall: 0.856,
        size: 21.5,
        params: '11.2M',
        epochs: 100,
        batchSize: 24,
        layers: [
            { type: 'conv', name: 'Conv', params: '3x3, 32' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '3x3, 64' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 128' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 256' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '1x1, 80' }
        ],
        trainLossData: [3.0, 2.6, 2.2, 1.9, 1.6, 1.4, 1.2, 1.05, 0.92, 0.82, 0.74, 0.67, 0.62, 0.58, 0.54, 0.51, 0.49, 0.47, 0.45, 0.44],
        valLossData: [3.3, 2.8, 2.4, 2.0, 1.7, 1.5, 1.3, 1.15, 1.02, 0.92, 0.84, 0.78, 0.73, 0.69, 0.66, 0.63, 0.61, 0.59, 0.58, 0.57],
        map50Data: [0.20, 0.29, 0.37, 0.44, 0.50, 0.55, 0.59, 0.62, 0.64, 0.655, 0.665, 0.672, 0.675, 0.677, 0.678, 0.678, 0.678, 0.678, 0.678, 0.678],
        map5095Data: [0.10, 0.16, 0.22, 0.28, 0.33, 0.38, 0.41, 0.43, 0.44, 0.45, 0.453, 0.455, 0.456, 0.456, 0.456, 0.456, 0.456, 0.456, 0.456, 0.456]
    },
    {
        id: 8,
        name: 'YOLOv8m - Custom Dataset',
        type: 'YOLOv8m',
        trainTime: '2024-01-08 10:45:00',
        dataset: '自定义数据集',
        map50: 0.756,
        map5095: 0.543,
        accuracy: 0.941,
        recall: 0.898,
        size: 47.2,
        params: '25.9M',
        epochs: 80,
        batchSize: 12,
        layers: [
            { type: 'conv', name: 'Conv', params: '3x3, 48' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '3x3, 96' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 192' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'pool', name: 'MaxPool', params: '2x2' },
            { type: 'conv', name: 'Conv', params: '3x3, 384' },
            { type: 'bn', name: 'BN', params: '' },
            { type: 'act', name: 'SiLU', params: '' },
            { type: 'conv', name: 'Conv', params: '1x1, 80' }
        ],
        trainLossData: [2.6, 2.2, 1.8, 1.5, 1.3, 1.1, 0.95, 0.83, 0.73, 0.65, 0.58, 0.53, 0.49, 0.46, 0.43, 0.41, 0.39, 0.37, 0.36, 0.35],
        valLossData: [2.9, 2.4, 2.0, 1.7, 1.4, 1.2, 1.05, 0.92, 0.82, 0.74, 0.68, 0.63, 0.59, 0.56, 0.54, 0.52, 0.50, 0.49, 0.48, 0.48],
        map50Data: [0.30, 0.42, 0.52, 0.60, 0.66, 0.70, 0.73, 0.745, 0.752, 0.755, 0.756, 0.756, 0.756, 0.756, 0.756, 0.756, 0.756, 0.756, 0.756, 0.756],
        map5095Data: [0.15, 0.24, 0.32, 0.39, 0.45, 0.49, 0.52, 0.535, 0.542, 0.543, 0.543, 0.543, 0.543, 0.543, 0.543, 0.543, 0.543, 0.543, 0.543, 0.543]
    }
];

function initTrainingModule() {
    initTrainingControls();
    initTrainingFormValidation();
}

function initTrainingControls() {
    const startBtn = document.getElementById('start-training-btn');
    const pauseBtn = document.getElementById('pause-training-btn');
    const stopBtn = document.getElementById('stop-training-btn');
    const clearLogsBtn = document.getElementById('clear-logs-btn');

    if (startBtn) {
        startBtn.addEventListener('click', startTraining);
    }
    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePauseTraining);
    }
    if (stopBtn) {
        stopBtn.addEventListener('click', stopTraining);
    }
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', clearTrainingLogs);
    }
}

function initTrainingFormValidation() {
    const inputs = document.querySelectorAll('#training-form input, #training-form select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateTrainingInput(input);
        });
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateTrainingInput(input);
            }
        });
    });
}

function validateTrainingInput(input) {
    const errorDiv = document.getElementById('training-error');
    input.classList.remove('error');
    errorDiv.classList.remove('show');

    const name = input.name;
    const value = input.value;

    if (name === 'epochs') {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 1000) {
            showTrainingError('Epochs 必须在 1-1000 之间');
            input.classList.add('error');
            return false;
        }
    } else if (name === 'batchSize') {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 128) {
            showTrainingError('Batch Size 必须在 1-128 之间');
            input.classList.add('error');
            return false;
        }
    } else if (name === 'learningRate') {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0.0001 || num > 1) {
            showTrainingError('Learning Rate 必须在 0.0001-1 之间');
            input.classList.add('error');
            return false;
        }
    } else if (name === 'imgSize') {
        const num = parseInt(value);
        if (isNaN(num) || num < 320 || num > 1280 || num % 32 !== 0) {
            showTrainingError('Image Size 必须是 32 的倍数，范围 320-1280');
            input.classList.add('error');
            return false;
        }
    } else if (name === 'workers') {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 32) {
            showTrainingError('Workers 必须在 1-32 之间');
            input.classList.add('error');
            return false;
        }
    }
    return true;
}

function validateTrainingConfig() {
    const inputs = document.querySelectorAll('#training-form input');
    let isValid = true;
    inputs.forEach(input => {
        if (!validateTrainingInput(input)) {
            isValid = false;
        }
    });
    return isValid;
}

function showTrainingError(message) {
    const errorDiv = document.getElementById('training-error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function hideTrainingError() {
    const errorDiv = document.getElementById('training-error');
    errorDiv.classList.remove('show');
}

function startTraining() {
    if (!validateTrainingConfig()) {
        return;
    }

    hideTrainingError();
    saveTrainingConfig();

    trainingState = 'running';
    currentEpoch = 0;
    trainLoss = 3.5 + Math.random() * 1;
    valLoss = 4 + Math.random() * 1.5;
    map50 = 0.1 + Math.random() * 0.1;
    map5095 = 0.05 + Math.random() * 0.05;
    startTime = new Date();

    updateTrainingStatus();
    updateProgressDisplay();
    updateMetricsDisplay();

    addTrainingLog('info', '开始训练 - 模型: ' + trainingConfig.model + ', 数据集: ' + trainingConfig.dataset);
    addTrainingLog('info', '参数: epochs=' + trainingConfig.epochs + ', batch_size=' + trainingConfig.batchSize + ', lr=' + trainingConfig.learningRate);

    startTrainingSimulation();
}

function saveTrainingConfig() {
    trainingConfig = {
        model: document.getElementById('model-select').value,
        dataset: document.getElementById('dataset-select').value,
        epochs: parseInt(document.getElementById('epochs-input').value),
        batchSize: parseInt(document.getElementById('batch-size-input').value),
        learningRate: parseFloat(document.getElementById('lr-input').value),
        imgSize: parseInt(document.getElementById('img-size-input').value),
        workers: parseInt(document.getElementById('workers-input').value)
    };
    totalEpochs = trainingConfig.epochs;
}

function startTrainingSimulation() {
    if (trainingInterval) {
        clearInterval(trainingInterval);
    }

    trainingInterval = setInterval(() => {
        if (trainingState !== 'running') {
            return;
        }

        currentEpoch++;

        trainLoss = Math.max(0.05, trainLoss * (0.96 + Math.random() * 0.03));
        valLoss = Math.max(0.08, valLoss * (0.95 + Math.random() * 0.04));
        map50 = Math.min(0.95, map50 + (0.015 + Math.random() * 0.01));
        map5095 = Math.min(0.75, map5095 + (0.01 + Math.random() * 0.008));

        updateProgressDisplay();
        updateMetricsDisplay();

        const batchesPerEpoch = 10;
        for (let i = 0; i < batchesPerEpoch; i++) {
            setTimeout(() => {
                if (trainingState !== 'running') return;
                addTrainingLog('info', 'Epoch ' + currentEpoch + '/' + totalEpochs + ' - Batch ' + (i + 1) + '/' + batchesPerEpoch);
            }, i * 100);
        }

        setTimeout(() => {
            if (trainingState !== 'running') return;
            addTrainingLog('info', 'Train Loss: ' + trainLoss.toFixed(4) + ' | Val Loss: ' + valLoss.toFixed(4));
            addTrainingLog('info', 'mAP@0.5: ' + map50.toFixed(4) + ' | mAP@0.5:0.95: ' + map5095.toFixed(4));
        }, batchesPerEpoch * 100 + 50);

        if (currentEpoch >= totalEpochs) {
            completeTraining();
        }
    }, 2000);
}

function togglePauseTraining() {
    if (trainingState === 'running') {
        trainingState = 'paused';
        addTrainingLog('warning', '训练已暂停');
    } else if (trainingState === 'paused') {
        trainingState = 'running';
        addTrainingLog('info', '训练已恢复');
    }
    updateTrainingStatus();
}

function stopTraining() {
    trainingState = 'stopped';

    if (trainingInterval) {
        clearInterval(trainingInterval);
        trainingInterval = null;
    }

    updateTrainingStatus();

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    addTrainingLog('info', '训练已停止 - 完成 ' + currentEpoch + '/' + totalEpochs + ' Epochs');
    addTrainingLog('info', '训练时长: ' + formatDuration(duration));

    showTrainingSummary('stopped');
}

function completeTraining() {
    trainingState = 'completed';

    if (trainingInterval) {
        clearInterval(trainingInterval);
        trainingInterval = null;
    }

    updateTrainingStatus();

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    addTrainingLog('success', '训练完成!');
    addTrainingLog('info', '训练时长: ' + formatDuration(duration));
    addTrainingLog('info', '最终结果 - Train Loss: ' + trainLoss.toFixed(4) + ', Val Loss: ' + valLoss.toFixed(4));
    addTrainingLog('info', '最终结果 - mAP@0.5: ' + map50.toFixed(4) + ', mAP@0.5:0.95: ' + map5095.toFixed(4));

    showTrainingSummary('completed');
}

function updateTrainingStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const startBtn = document.getElementById('start-training-btn');
    const pauseBtn = document.getElementById('pause-training-btn');
    const stopBtn = document.getElementById('stop-training-btn');

    statusDot.className = 'status-dot';

    switch (trainingState) {
        case 'running':
            statusDot.classList.add('running');
            statusText.textContent = '运行中';
            statusText.style.color = 'var(--primary-color)';
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            break;
        case 'paused':
            statusDot.classList.add('paused');
            statusText.textContent = '已暂停';
            statusText.style.color = 'var(--warning-color)';
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
            break;
        case 'completed':
            statusDot.classList.add('completed');
            statusText.textContent = '已完成';
            statusText.style.color = 'var(--success-color)';
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            break;
        case 'stopped':
        default:
            statusDot.classList.add('stopped');
            statusText.textContent = '已停止';
            statusText.style.color = 'var(--text-secondary)';
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            break;
    }
}

function updateProgressDisplay() {
    const epochEl = document.getElementById('current-epoch');
    const progressEl = document.getElementById('total-progress');
    const progressBar = document.getElementById('training-progress-bar');

    const progress = Math.round((currentEpoch / totalEpochs) * 100);

    epochEl.textContent = currentEpoch + ' / ' + totalEpochs;
    progressEl.textContent = progress + '%';
    progressBar.style.width = progress + '%';

    if (currentEpoch >= totalEpochs) {
        progressBar.classList.add('progress-bar-success');
    } else {
        progressBar.classList.remove('progress-bar-success');
    }
}

function updateMetricsDisplay() {
    document.getElementById('train-loss').textContent = trainLoss.toFixed(4);
    document.getElementById('val-loss').textContent = valLoss.toFixed(4);
    document.getElementById('map-50').textContent = map50.toFixed(4);
    document.getElementById('map-50-95').textContent = map5095.toFixed(4);
}

function addTrainingLog(type, message) {
    const logsContainer = document.getElementById('logs-container');
    const logItem = document.createElement('div');
    logItem.className = 'log-item';

    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');

    logItem.innerHTML = '<span class="log-time">' + timeStr + '</span><span class="log-content ' + type + '">' + message + '</span>';
    logsContainer.appendChild(logItem);

    logsContainer.scrollTop = logsContainer.scrollHeight;
}

function clearTrainingLogs() {
    const logsContainer = document.getElementById('logs-container');
    logsContainer.innerHTML = '<div class="log-item"><span class="log-time">--:--:--</span><span class="log-content">等待训练开始...</span></div>';
}

function showTrainingSummary(type) {
    const summaryEl = document.getElementById('training-summary');
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    let summaryHtml = '<h4>训练总结</h4><div class="summary-content">';

    if (type === 'stopped') {
        summaryHtml += '<p><strong>状态:</strong> 已停止</p>';
        summaryHtml += '<p><strong>完成进度:</strong> ' + currentEpoch + '/' + totalEpochs + ' Epochs (' + Math.round((currentEpoch / totalEpochs) * 100) + '%)</p>';
        summaryHtml += '<p><strong>训练时长:</strong> ' + formatDuration(duration) + '</p>';
        summaryHtml += '<p><strong>当前损失:</strong> Train ' + trainLoss.toFixed(4) + ' | Val ' + valLoss.toFixed(4) + '</p>';
        summaryHtml += '<p><strong>当前mAP:</strong> @0.5: ' + map50.toFixed(4) + ' | @0.5:0.95: ' + map5095.toFixed(4) + '</p>';
    } else if (type === 'completed') {
        summaryHtml += '<p><strong>状态:</strong> 训练完成</p>';
        summaryHtml += '<p><strong>完成进度:</strong> ' + currentEpoch + '/' + totalEpochs + ' Epochs (100%)</p>';
        summaryHtml += '<p><strong>训练时长:</strong> ' + formatDuration(duration) + '</p>';
        summaryHtml += '<p><strong>最终损失:</strong> Train ' + trainLoss.toFixed(4) + ' | Val ' + valLoss.toFixed(4) + '</p>';
        summaryHtml += '<p><strong>最终mAP:</strong> @0.5: ' + map50.toFixed(4) + ' | @0.5:0.95: ' + map5095.toFixed(4) + '</p>';
        summaryHtml += '<p><strong>模型名称:</strong> ' + trainingConfig.model + '</p>';
    }

    summaryHtml += '</div>';
    summaryEl.innerHTML = summaryHtml;
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return hours + '小时 ' + minutes + '分 ' + secs + '秒';
    } else if (minutes > 0) {
        return minutes + '分 ' + secs + '秒';
    } else {
        return secs + '秒';
    }
}

function initModelsModule() {
    renderModelList(mockModels);
    initModelSearch();
    initModelSort();
    initModelModal();
}

function renderModelList(models) {
    const container = document.getElementById('model-grid-container');
    container.innerHTML = '';

    models.forEach(model => {
        const card = document.createElement('div');
        card.className = 'model-card';
        card.innerHTML = `
            <div class="model-card-header">
                <div class="model-icon">🧠</div>
                <div class="model-card-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-type">${model.type}</div>
                </div>
            </div>
            <div class="model-card-stats">
                <div class="stat-item">
                    <div class="stat-item-label">mAP@0.5</div>
                    <div class="stat-item-value map">${model.map50.toFixed(3)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-item-label">准确率</div>
                    <div class="stat-item-value">${(model.accuracy * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-item-label">模型大小</div>
                    <div class="stat-item-value size">${model.size} MB</div>
                </div>
                <div class="stat-item">
                    <div class="stat-item-label">参数量</div>
                    <div class="stat-item-value">${model.params}</div>
                </div>
            </div>
            <div class="model-card-footer">
                <div class="model-card-time">${model.trainTime}</div>
                <div class="model-card-actions">
                    <button class="btn btn-outline btn-sm" onclick="openModelPreview(${model.id})">预览</button>
                    <button class="btn btn-primary btn-sm" onclick="startDownload(${model.id})">下载</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function initModelSearch() {
    const searchInput = document.getElementById('model-search');
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = mockModels.filter(model => 
            model.name.toLowerCase().includes(keyword) || 
            model.type.toLowerCase().includes(keyword) ||
            model.dataset.toLowerCase().includes(keyword)
        );
        renderModelList(filtered);
    });
}

function initModelSort() {
    const sortSelect = document.getElementById('model-sort');
    sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        const sorted = [...mockModels];
        
        switch (sortBy) {
            case 'time-desc':
                sorted.sort((a, b) => new Date(b.trainTime) - new Date(a.trainTime));
                break;
            case 'time-asc':
                sorted.sort((a, b) => new Date(a.trainTime) - new Date(b.trainTime));
                break;
            case 'map-desc':
                sorted.sort((a, b) => b.map50 - a.map50);
                break;
            case 'map-asc':
                sorted.sort((a, b) => a.map50 - b.map50);
                break;
            case 'size-desc':
                sorted.sort((a, b) => b.size - a.size);
                break;
            case 'size-asc':
                sorted.sort((a, b) => a.size - b.size);
                break;
        }
        
        renderModelList(sorted);
    });
}

function initModelModal() {
    const modal = document.getElementById('model-preview-modal');
    const closeBtn = document.getElementById('modal-close');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    closeBtn.addEventListener('click', closeModelPreview);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModelPreview();
        }
    });
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            const targetTab = document.getElementById('tab-' + e.target.dataset.tab);
            targetTab.classList.add('active');
            targetTab.style.display = 'block';
        });
    });
}

function openModelPreview(modelId) {
    const model = mockModels.find(m => m.id === modelId);
    if (!model) return;

    document.getElementById('modal-title').textContent = model.name;
    
    document.getElementById('preview-name').textContent = model.name;
    document.getElementById('preview-type').textContent = model.type;
    document.getElementById('preview-time').textContent = model.trainTime;
    document.getElementById('preview-dataset').textContent = model.dataset;
    document.getElementById('preview-size').textContent = model.size + ' MB';
    document.getElementById('preview-params').textContent = model.params;
    
    document.getElementById('preview-map50').textContent = model.map50.toFixed(4);
    document.getElementById('preview-map5095').textContent = model.map5095.toFixed(4);
    document.getElementById('preview-accuracy').textContent = (model.accuracy * 100).toFixed(2) + '%';
    document.getElementById('preview-recall').textContent = (model.recall * 100).toFixed(2) + '%';
    
    renderModelStructure(model);
    drawLossChart(model);
    drawMapChart(model);
    
    document.getElementById('model-preview-modal').classList.add('show');
}

function closeModelPreview() {
    document.getElementById('model-preview-modal').classList.remove('show');
}

function renderModelStructure(model) {
    const container = document.getElementById('model-structure');
    let html = '';
    model.layers.forEach((layer, index) => {
        html += '<div class="layer ' + layer.type + '" title="' + layer.params + '">';
        html += '<span style="color: #60a5fa">' + String(index + 1).padStart(2, '0') + '.</span> ';
        html += '<span style="color: #10b981">' + layer.name + '</span>';
        if (layer.params) {
            html += '<span style="color: #94a3b8"> (' + layer.params + ')</span>';
        }
        html += '</div>';
    });
    container.innerHTML = html;
}

function drawLossChart(model) {
    const svg = document.getElementById('loss-chart');
    const width = svg.parentElement.clientWidth - 48;
    const height = 250;
    const padding = 40;
    
    svg.innerHTML = '';
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    
    const trainData = model.trainLossData;
    const valData = model.valLossData;
    
    const maxVal = Math.max(...trainData, ...valData) * 1.1;
    const minVal = Math.min(...trainData, ...valData) * 0.9;
    const range = maxVal - minVal;
    
    const xScale = (i) => padding + (i / (trainData.length - 1)) * (width - 2 * padding);
    const yScale = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);
    
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * (height - 2 * padding);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#334155');
        line.setAttribute('stroke-dasharray', '4');
        gridGroup.appendChild(line);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding - 10);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '10');
        text.textContent = (maxVal - (i / 5) * range).toFixed(2);
        gridGroup.appendChild(text);
    }
    svg.appendChild(gridGroup);
    
    const drawLine = (data, color) => {
        let path = 'M ' + xScale(0) + ' ' + yScale(data[0]);
        for (let i = 1; i < data.length; i++) {
            path += ' L ' + xScale(i) + ' ' + yScale(data[i]);
        }
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', path);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('stroke-linejoin', 'round');
        return line;
    };
    
    svg.appendChild(drawLine(trainData, '#3b82f6'));
    svg.appendChild(drawLine(valData, '#ef4444'));
    
    const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const legend1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    legend1.setAttribute('cx', width - padding - 100);
    legend1.setAttribute('cy', padding - 15);
    legend1.setAttribute('r', '4');
    legend1.setAttribute('fill', '#3b82f6');
    legendGroup.appendChild(legend1);
    
    const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text1.setAttribute('x', width - padding - 90);
    text1.setAttribute('y', padding - 11);
    text1.setAttribute('fill', '#94a3b8');
    text1.setAttribute('font-size', '11');
    text1.textContent = '训练损失';
    legendGroup.appendChild(text1);
    
    const legend2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    legend2.setAttribute('cx', width - padding - 30);
    legend2.setAttribute('cy', padding - 15);
    legend2.setAttribute('r', '4');
    legend2.setAttribute('fill', '#ef4444');
    legendGroup.appendChild(legend2);
    
    const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text2.setAttribute('x', width - padding - 20);
    text2.setAttribute('y', padding - 11);
    text2.setAttribute('fill', '#94a3b8');
    text2.setAttribute('font-size', '11');
    text2.textContent = '验证损失';
    legendGroup.appendChild(text2);
    
    svg.appendChild(legendGroup);
}

function drawMapChart(model) {
    const svg = document.getElementById('map-chart');
    const width = svg.parentElement.clientWidth - 48;
    const height = 250;
    const padding = 40;
    
    svg.innerHTML = '';
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    
    const map50Data = model.map50Data;
    const map5095Data = model.map5095Data;
    
    const maxVal = Math.max(...map50Data, ...map5095Data) * 1.1;
    const minVal = Math.min(...map50Data, ...map5095Data) * 0.9;
    const range = maxVal - minVal;
    
    const xScale = (i) => padding + (i / (map50Data.length - 1)) * (width - 2 * padding);
    const yScale = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);
    
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * (height - 2 * padding);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#334155');
        line.setAttribute('stroke-dasharray', '4');
        gridGroup.appendChild(line);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding - 10);
        text.setAttribute('y', y + 4);
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '10');
        text.textContent = (maxVal - (i / 5) * range).toFixed(2);
        gridGroup.appendChild(text);
    }
    svg.appendChild(gridGroup);
    
    const drawLine = (data, color) => {
        let path = 'M ' + xScale(0) + ' ' + yScale(data[0]);
        for (let i = 1; i < data.length; i++) {
            path += ' L ' + xScale(i) + ' ' + yScale(data[i]);
        }
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', path);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('stroke-linejoin', 'round');
        return line;
    };
    
    svg.appendChild(drawLine(map50Data, '#10b981'));
    svg.appendChild(drawLine(map5095Data, '#f59e0b'));
    
    const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    const legend1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    legend1.setAttribute('cx', width - padding - 100);
    legend1.setAttribute('cy', padding - 15);
    legend1.setAttribute('r', '4');
    legend1.setAttribute('fill', '#10b981');
    legendGroup.appendChild(legend1);
    
    const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text1.setAttribute('x', width - padding - 90);
    text1.setAttribute('y', padding - 11);
    text1.setAttribute('fill', '#94a3b8');
    text1.setAttribute('font-size', '11');
    text1.textContent = 'mAP@0.5';
    legendGroup.appendChild(text1);
    
    const legend2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    legend2.setAttribute('cx', width - padding - 30);
    legend2.setAttribute('cy', padding - 15);
    legend2.setAttribute('r', '4');
    legend2.setAttribute('fill', '#f59e0b');
    legendGroup.appendChild(legend2);
    
    const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text2.setAttribute('x', width - padding - 20);
    text2.setAttribute('y', padding - 11);
    text2.setAttribute('fill', '#94a3b8');
    text2.setAttribute('font-size', '11');
    text2.textContent = 'mAP@0.5:0.95';
    legendGroup.appendChild(text2);

    svg.appendChild(legendGroup);
}

let downloadHistory = [];
let downloadInterval = null;

function initDownloadModule() {
    renderDownloadCards(mockModels);
    initDownloadModal();
    initDownloadHistory();
    initModalDownloadButton();
    initModalDeleteButton();
}

function renderDownloadCards(models) {
    const container = document.getElementById('download-grid-container');
    container.innerHTML = '';

    models.forEach(model => {
        const card = document.createElement('div');
        card.className = 'download-card';
        card.innerHTML = `
            <div class="download-icon">📦</div>
            <div class="download-info">
                <h3 class="download-name">${model.name}</h3>
                <p class="download-desc">${model.type} - ${model.dataset}</p>
                <div class="download-meta">
                    <span class="download-item">大小: ${model.size} MB</span>
                    <span class="download-item">mAP: ${model.map50.toFixed(3)}</span>
                    <span class="download-item">参数量: ${model.params}</span>
                </div>
            </div>
            <button class="btn btn-primary download-btn" onclick="startDownload(${model.id})">下载</button>
        `;
        container.appendChild(card);
    });
}

function initDownloadModal() {
    const modal = document.getElementById('download-progress-modal');
    const closeBtn = document.getElementById('download-modal-close');

    closeBtn.addEventListener('click', () => {
        if (downloadInterval) {
            clearInterval(downloadInterval);
            downloadInterval = null;
        }
        modal.classList.remove('show');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (downloadInterval) {
                clearInterval(downloadInterval);
                downloadInterval = null;
            }
            modal.classList.remove('show');
        }
    });
}

function initDownloadHistory() {
    const clearBtn = document.getElementById('clear-download-history');
    clearBtn.addEventListener('click', () => {
        downloadHistory = [];
        renderDownloadHistory();
    });
}

function initModalDownloadButton() {
    const downloadBtn = document.getElementById('modal-download');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const modelName = document.getElementById('preview-name').textContent;
            const model = mockModels.find(m => m.name === modelName);
            if (model) {
                closeModelPreview();
                setTimeout(() => startDownload(model.id), 300);
            }
        });
    }
}

function initModalDeleteButton() {
    const deleteBtn = document.getElementById('modal-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const modelName = document.getElementById('preview-name').textContent;
            if (confirm('确认删除模型 "' + modelName + '" 吗？此操作不可撤销。')) {
                const modelIndex = mockModels.findIndex(m => m.name === modelName);
                if (modelIndex !== -1) {
                    mockModels.splice(modelIndex, 1);
                    renderModelList(mockModels);
                    renderDownloadCards(mockModels);
                    closeModelPreview();
                }
            }
        });
    }
}

function startDownload(modelId) {
    const model = mockModels.find(m => m.id === modelId);
    if (!model) return;

    const modal = document.getElementById('download-progress-modal');
    const progressBar = document.getElementById('download-progress-bar');
    const progressText = document.getElementById('download-progress-text');
    const speedText = document.getElementById('download-speed-text');
    const modalTitle = document.getElementById('download-modal-title');
    const progressName = document.getElementById('download-progress-name');
    const progressSize = document.getElementById('download-progress-size');

    modalTitle.textContent = '正在下载模型...';
    progressName.textContent = model.name;
    progressSize.textContent = model.size + ' MB';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    speedText.textContent = '准备中...';

    modal.classList.add('show');

    const totalSize = model.size;
    let progress = 0;
    const startTime = Date.now();

    const historyEntry = {
        id: Date.now(),
        modelId: model.id,
        modelName: model.name,
        size: model.size,
        status: 'downloading',
        time: new Date().toLocaleString('zh-CN'),
        progress: 0
    };
    downloadHistory.unshift(historyEntry);
    renderDownloadHistory();

    if (downloadInterval) {
        clearInterval(downloadInterval);
    }

    downloadInterval = setInterval(() => {
        const increment = (0.5 + Math.random() * 3) * (1 - progress / 100);
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            clearInterval(downloadInterval);
            downloadInterval = null;

            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            speedText.textContent = '下载完成';

            modalTitle.textContent = '下载完成!';
            progressBar.classList.add('progress-bar-success');

            historyEntry.status = 'completed';
            historyEntry.progress = 100;
            renderDownloadHistory();

            setTimeout(() => {
                modal.classList.remove('show');
                progressBar.classList.remove('progress-bar-success');
            }, 2000);
        } else {
            const elapsed = (Date.now() - startTime) / 1000;
            const downloaded = (progress / 100) * totalSize;
            const speed = downloaded / Math.max(elapsed, 0.1);
            const remaining = ((totalSize - downloaded) / Math.max(speed, 0.01)).toFixed(0);

            progressBar.style.width = progress + '%';
            progressText.textContent = progress.toFixed(0) + '%';
            speedText.textContent = speed.toFixed(1) + ' MB/s - 剩余 ' + remaining + 's';

            historyEntry.progress = Math.round(progress);
            updateHistoryProgress(historyEntry.id, Math.round(progress));
        }
    }, 300);
}

function updateHistoryProgress(entryId, progress) {
    const entry = downloadHistory.find(e => e.id === entryId);
    if (entry) {
        entry.progress = progress;
    }
}

function renderDownloadHistory() {
    const container = document.getElementById('download-history-list');

    if (downloadHistory.length === 0) {
        container.innerHTML = '<div class="download-history-empty">暂无下载记录</div>';
        return;
    }

    container.innerHTML = '';
    downloadHistory.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'download-history-item';
        item.setAttribute('data-id', entry.id);

        let statusClass = '';
        let statusText = '';
        switch (entry.status) {
            case 'completed':
                statusClass = 'completed';
                statusText = '已完成';
                break;
            case 'downloading':
                statusClass = 'downloading';
                statusText = '下载中 ' + entry.progress + '%';
                break;
            case 'failed':
                statusClass = 'failed';
                statusText = '失败';
                break;
        }

        item.innerHTML = `
            <div class="download-history-item-info">
                <div class="download-history-item-icon">📦</div>
                <div class="download-history-item-details">
                    <span class="download-history-item-name">${entry.modelName}</span>
                    <span class="download-history-item-meta">${entry.size} MB</span>
                </div>
            </div>
            <div class="download-history-item-status">
                <span class="download-history-status ${statusClass}">${statusText}</span>
                <span class="download-history-time">${entry.time}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function initApp() {
    initLogin();
    initNavigation();
    initTrainingModule();
    initModelsModule();
    initDownloadModule();
}

function initLogin() {
    const loginForm = document.getElementById('login-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin' && password === 'admin') {
            loadingOverlay.classList.add('show');
            setTimeout(() => {
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('main-app').classList.remove('hidden');
                loadingOverlay.classList.remove('show');
            }, 1500);
        } else {
            errorMessage.textContent = '用户名或密码错误';
            errorMessage.classList.add('show');
        }
    });

    document.getElementById('username').addEventListener('input', () => {
        errorMessage.classList.remove('show');
    });

    document.getElementById('password').addEventListener('input', () => {
        errorMessage.classList.remove('show');
    });

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const pageContents = document.querySelectorAll('.page-content');

    const pageInfo = {
        dashboard: { title: '仪表盘', subtitle: '实时监控训练状态与系统概览' },
        datasets: { title: '数据集管理', subtitle: '上传、管理和标注数据集' },
        training: { title: '模型训练', subtitle: '配置参数并启动模型训练' },
        models: { title: '模型管理', subtitle: '管理已训练的模型' },
        download: { title: '模型下载', subtitle: '下载预训练模型' }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const pageId = link.dataset.page;
            
            pageContents.forEach(page => {
                page.classList.remove('active');
            });
            
            document.getElementById('page-' + pageId).classList.add('active');
            
            pageTitle.textContent = pageInfo[pageId].title;
            pageSubtitle.textContent = pageInfo[pageId].subtitle;
        });
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});