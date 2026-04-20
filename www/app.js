/**
 * CromCalc 2026 — Lógica de Cálculo
 * Calculadora de orçamento para serviços de Cromagem e Retífica
 * 
 * Baseado na planilha CromCalc_2026.xlsx
 * Todas as fórmulas e tabelas de referência estão hardcoded.
 */

// ============================================
// Tabelas de Referência (Plan2 da planilha)
// ============================================

// IMPORTANTE: A faixa é determinada pelo DIÂMETRO (B7), não pela área!
// Mas o cálculo do valor base usa a ÁREA (B9).
const FAIXAS_DIAMETRO = [
    { min: 0,   max: 25,   fator: 32.1, k: 0   },
    { min: 25,  max: 50,   fator: 27.3, k: 35  },
    { min: 50,  max: 100,  fator: 24.1, k: 61  },
    { min: 100, max: 150,  fator: 21.5, k: 125 },
    { min: 150, max: Infinity, fator: 18.2, k: 300 }
];

const SERVICOS = {
    cromoCamada:     { nome: 'Cromo Camada',      calculo: (vb) => vb * 2 },
    cromagemCliente: { nome: 'Cromagem Cliente',   calculo: (vb) => vb / 0.85 },
    retifica:        { nome: 'Retífica',           calculo: (vb) => vb * 0.588 },
    mecanico:        { nome: 'Mecânico',           calculo: (vb) => vb }
};

// Valores de referência rápida (Plan2, colunas F e G)
const DIAMETROS_REF = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,55,60,65,70,75,80,85,90,95,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,550,600,650,700,750,800,850,900,950,1000];
const COMPRIMENTOS_REF = [10,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490,500,550,600,650,700,750,800,850,900,950,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2100,2200,2300,2400,2500,2600,2700,2800,2900,3000,3100,3200,3300,3400,3500,3600,3700,3800,3900,4000,4100,4200,4300,4400,4500];

// ============================================
// Estado do App
// ============================================

let state = {
    diametro: 0,
    comprimento: 0,
    servico: 'cromoCamada'
};

// ============================================
// Funções de Cálculo
// ============================================

/**
 * Calcula a área lateral do cilindro em dcm²
 * Fórmula: π × Ø(mm) × l(mm) ÷ 10.000
 */
function calcularArea(diametro, comprimento) {
    if (diametro <= 0 || comprimento <= 0) return 0;
    return Math.PI * diametro * comprimento / 10000;
}

/**
 * Calcula o peso estimado da peça em kg (aço maciço, densidade 7.87 g/cm³)
 * Fórmula: π × (Ø/2/10)² × (l/10) × 7.87 ÷ 1000
 */
function calcularPeso(diametro, comprimento) {
    if (diametro <= 0 || comprimento <= 0) return 0;
    const raio_cm = diametro / 2 / 10;
    const comprimento_cm = comprimento / 10;
    return Math.PI * Math.pow(raio_cm, 2) * comprimento_cm * 7.87 / 1000;
}

/**
 * Identifica a faixa pela ÁREA e retorna o nome legível
 */
function identificarFaixa(area) {
    if (area <= 0) return '—';
    if (area <= 25) return '1 a 25';
    if (area <= 50) return '26 a 50';
    if (area <= 100) return '51 a 100';
    if (area <= 150) return '101 a 150';
    return '> 150';
}

/**
 * Calcula o valor base usando a tabela de faixas baseada na ÁREA
 * CÁLCULO usa a ÁREA: Valor = (Área × Fator_da_faixa) + k_da_faixa
 */
function calcularValorBase(area) {
    if (area <= 0) return 0;
    
    if (area <= 25) return (area * 32.1) + 0;
    if (area <= 50) return (area * 27.3) + 35;
    if (area <= 100) return (area * 24.1) + 61;
    if (area <= 150) return (area * 21.5) + 125;
    return (area * 18.2) + 300;
}

/**
 * Calcula o preço final baseado no tipo de serviço
 */
function calcularPrecoFinal(valorBase, servico) {
    if (valorBase <= 0) return 0;
    const srv = SERVICOS[servico];
    if (!srv) return valorBase;
    return srv.calculo(valorBase);
}

// ============================================
// Formatação
// ============================================

/**
 * Formata valor monetário no padrão brasileiro
 * Ex: 1210.55 → "1.210,55"
 */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Formata número com casas decimais
 */
function formatarNumero(valor, casas = 2) {
    if (valor === 0) return '—';
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

// ============================================
// UI - Atualização dos Resultados
// ============================================

function atualizarResultados() {
    const { diametro, comprimento, servico } = state;
    
    // Calcular tudo
    const area = calcularArea(diametro, comprimento);
    const peso = calcularPeso(diametro, comprimento);
    const faixa = identificarFaixa(area);
    const valorBase = calcularValorBase(area);
    const precoFinal = calcularPrecoFinal(valorBase, servico);
    
    // Atualizar exibição
    const elArea = document.getElementById('result-area');
    const elPeso = document.getElementById('result-peso');
    const elFaixa = document.getElementById('result-faixa');
    const elBase = document.getElementById('result-base');
    const elPreco = document.getElementById('result-preco');
    const elPriceDisplay = document.getElementById('price-display');
    const elServiceLabel = document.getElementById('price-service-label');
    
    const hasValues = diametro > 0 && comprimento > 0;
    
    // Resultados intermediários
    elArea.textContent = hasValues ? formatarNumero(area, 4) : '—';
    elPeso.textContent = hasValues ? formatarNumero(peso, 2) : '—';
    elFaixa.textContent = hasValues ? faixa : '—';
    elBase.textContent = hasValues ? formatarMoeda(valorBase) : '—';
    
    // Preço final
    elPreco.textContent = hasValues ? formatarMoeda(precoFinal) : '0,00';
    elServiceLabel.textContent = SERVICOS[servico].nome;
    
    // Visual feedback
    if (hasValues) {
        elPriceDisplay.classList.add('has-value');
        
        // Flash animation
        elPreco.classList.remove('value-flash');
        void elPreco.offsetWidth; // Force reflow
        elPreco.classList.add('value-flash');
        
        // Highlight info cards with values
        document.querySelectorAll('.info-value').forEach(el => {
            el.classList.add('updated');
            setTimeout(() => el.classList.remove('updated'), 600);
        });
        
        // Haptic feedback (if available)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    } else {
        elPriceDisplay.classList.remove('has-value');
    }
}

// ============================================
// Event Listeners
// ============================================

function initApp() {
    const inputDiametro = document.getElementById('diametro');
    const inputComprimento = document.getElementById('comprimento');
    const serviceButtons = document.querySelectorAll('.service-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // --- Input Handlers ---
    inputDiametro.addEventListener('input', (e) => {
        state.diametro = parseFloat(e.target.value) || 0;
        updateQuickSelectHighlight('quick-diametro', state.diametro);
        atualizarResultados();
    });
    
    inputComprimento.addEventListener('input', (e) => {
        state.comprimento = parseFloat(e.target.value) || 0;
        updateQuickSelectHighlight('quick-comprimento', state.comprimento);
        atualizarResultados();
    });
    
    // Select all text on focus (for easy re-entry)
    inputDiametro.addEventListener('focus', (e) => e.target.select());
    inputComprimento.addEventListener('focus', (e) => e.target.select());
    
    // --- Service Button Handlers ---
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            serviceButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.servico = btn.dataset.service;
            atualizarResultados();
            
            if (navigator.vibrate) {
                navigator.vibrate(5);
            }
        });
    });
    
    // --- Quick Select Handlers ---
    document.getElementById('quick-diametro').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const val = parseFloat(e.target.dataset.value);
            inputDiametro.value = val;
            state.diametro = val;
            updateQuickSelectHighlight('quick-diametro', val);
            atualizarResultados();
        }
    });
    
    document.getElementById('quick-comprimento').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const val = parseFloat(e.target.dataset.value);
            inputComprimento.value = val;
            state.comprimento = val;
            updateQuickSelectHighlight('quick-comprimento', val);
            atualizarResultados();
        }
    });
    
    // --- Clear Button ---
    clearBtn.addEventListener('click', () => {
        state.diametro = 0;
        state.comprimento = 0;
        state.servico = 'cromoCamada';
        
        inputDiametro.value = '';
        inputComprimento.value = '';
        
        serviceButtons.forEach(b => b.classList.remove('active'));
        serviceButtons[0].classList.add('active');
        
        clearAllQuickSelects();
        atualizarResultados();
        
        inputDiametro.focus();
        
        if (navigator.vibrate) {
            navigator.vibrate([10, 50, 10]);
        }
    });
    
    // Initial render
    atualizarResultados();
}

function updateQuickSelectHighlight(containerId, value) {
    const container = document.getElementById(containerId);
    container.querySelectorAll('button').forEach(btn => {
        if (parseFloat(btn.dataset.value) === value) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function clearAllQuickSelects() {
    document.querySelectorAll('.quick-select button').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// ============================================
// Service Worker Registration
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    });
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', initApp);
