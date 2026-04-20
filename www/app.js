/**
 * CromCalc 2026 — Lógica de Cálculo FINAL (Ajustada pelo Diâmetro)
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
    return (Math.PI * diametro * comprimento) / 10000;
}

/**
 * DETERMINAÇÃO DA FAIXA PELO DIÂMETRO (Conforme comportamento do Excel)
 */
function obterConfigFaixa(diametro) {
    if (diametro > 50)  return { fator: 32.1, k: 0,   nome: 'Faixa 1 (>50)' };
    if (diametro > 25)  return { fator: 27.3, k: 35,  nome: 'Faixa 2 (26-50)' };
    if (diametro > 15)  return { fator: 24.1, k: 61,  nome: 'Faixa 3 (16-25)' };
    if (diametro > 10)  return { fator: 21.5, k: 125, nome: 'Faixa 4 (11-15)' };
    return { fator: 18.2, k: 300, nome: 'Faixa 5 (≤10)' };
}

function atualizarResultados() {
    const area = calcularArea(state.diametro, state.comprimento);
    const config = obterConfigFaixa(state.diametro);

    // O Valor Base usa a Área, mas os coeficientes vêm do Diâmetro
    const valorBase = area > 0 ? (area * config.fator) + config.k : 0;
    const precoFinal = SERVICOS[state.servico].calculo(valorBase);

    document.getElementById('result-area').textContent = area > 0 ? area.toLocaleString('pt-BR', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '—';
    document.getElementById('result-faixa').textContent = area > 0 ? config.nome : '—';
    document.getElementById('result-base').textContent = area > 0 ? valorBase.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '—';
    document.getElementById('result-preco').textContent = area > 0 ? precoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0,00';
    document.getElementById('price-service-label').textContent = SERVICOS[state.servico].nome;
}

function initApp() {
    const inD = document.getElementById('diametro');
    const inL = document.getElementById('comprimento');

    inD.addEventListener('input', (e) => { state.diametro = parseFloat(e.target.value) || 0; atualizarResultados(); });
    inL.addEventListener('input', (e) => { state.comprimento = parseFloat(e.target.value) || 0; atualizarResultados(); });

    document.querySelectorAll('.service-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.service-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.servico = btn.dataset.service;
            atualizarResultados();
        });
    });

    document.querySelectorAll('.quick-select button').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseFloat(btn.dataset.value);
            if (btn.parentElement.id === 'quick-diametro') { inD.value = val; state.diametro = val; }
            else { inL.value = val; state.comprimento = val; }
            atualizarResultados();
        });
    });
}
document.addEventListener('DOMContentLoaded', initApp);
