/**
 * CromCalc 2026 — Lógica de Cálculo Corrigida
 */

const SERVICOS = {
    cromoCamada:     { nome: 'Cromo Camada',      calculo: (vb) => vb * 2 },
    cromagemCliente: { nome: 'Cromagem Cliente',   calculo: (vb) => vb / 0.85 },
    retifica:        { nome: 'Retífica',           calculo: (vb) => vb * 0.588 },
    mecanico:        { nome: 'Mecânico',           calculo: (vb) => vb }
};

let state = {
    diametro: 0,
    comprimento: 0,
    servico: 'cromoCamada'
};

function calcularArea(diametro, comprimento) {
    if (diametro <= 0 || comprimento <= 0) return 0;
    return Math.PI * diametro * comprimento / 10000;
}

function identificarFaixa(area) {
    if (area <= 0) return '—';
    if (area <= 25) return '1 a 25';
    if (area <= 50) return '26 a 50';
    if (area <= 100) return '51 a 100';
    if (area <= 150) return '101 a 150';
    return '> 150';
}

function calcularValorBase(area) {
    if (area <= 0) return 0;
    if (area <= 25) return (area * 32.1);
    if (area <= 50) return (area * 27.3) + 35;
    if (area <= 100) return (area * 24.1) + 61;
    if (area <= 150) return (area * 21.5) + 125;
    return (area * 18.2) + 300;
}

function calcularPeso(diametro, comprimento) {
    if (diametro <= 0 || comprimento <= 0) return 0;
    const raio_cm = diametro / 2 / 10;
    const comprimento_cm = comprimento / 10;
    return Math.PI * Math.pow(raio_cm, 2) * comprimento_cm * 7.87 / 1000;
}

function atualizarResultados() {
    const area = calcularArea(state.diametro, state.comprimento);
    const peso = calcularPeso(state.diametro, state.comprimento);
    const faixa = identificarFaixa(area);
    const valorBase = calcularValorBase(area);
    const precoFinal = SERVICOS[state.servico].calculo(valorBase);

    document.getElementById('result-area').textContent = area > 0 ? area.toLocaleString('pt-BR', {minimumFractionDigits: 4}) : '—';
    document.getElementById('result-peso').textContent = area > 0 ? peso.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '—';
    document.getElementById('result-faixa').textContent = area > 0 ? faixa : '—';
    document.getElementById('result-base').textContent = area > 0 ? valorBase.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '—';
    document.getElementById('result-preco').textContent = area > 0 ? precoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00';
    document.getElementById('price-service-label').textContent = SERVICOS[state.servico].nome;
}

function initApp() {
    const inD = document.getElementById('diametro');
    const inL = document.getElementById('comprimento');
    const serviceButtons = document.querySelectorAll('.service-btn');
    const clearBtn = document.getElementById('clear-btn');

    inD.addEventListener('input', (e) => {
        state.diametro = parseFloat(e.target.value) || 0;
        atualizarResultados();
    });
    inL.addEventListener('input', (e) => {
        state.comprimento = parseFloat(e.target.value) || 0;
        atualizarResultados();
    });

    serviceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            serviceButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.servico = btn.dataset.service;
            atualizarResultados();
        });
    });

    clearBtn.addEventListener('click', () => {
        inD.value = ''; inL.value = '';
        state.diametro = 0; state.comprimento = 0; state.servico = 'cromoCamada';
        serviceButtons.forEach(b => b.classList.remove('active'));
        serviceButtons[0].classList.add('active');
        atualizarResultados();
    });
}

document.addEventListener('DOMContentLoaded', initApp);
