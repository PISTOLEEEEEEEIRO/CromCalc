/**
 * CromCalc 2026 — v2.2 (Versão Ultra-Robust)
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

function obterConfigFaixa(diametro) {
    if (diametro > 50)  return { fator: 32.1, k: 0,   nome: 'Faixa 1 (>50)' };
    if (diametro > 25)  return { fator: 27.3, k: 35,  nome: 'Faixa 2 (26-50)' };
    if (diametro > 15)  return { fator: 24.1, k: 61,  nome: 'Faixa 3 (16-25)' };
    if (diametro > 10)  return { fator: 21.5, k: 125, nome: 'Faixa 4 (11-15)' };
    return { fator: 18.2, k: 300, nome: 'Faixa 5 (≤10)' };
}

function atualizarResultados() {
    const inD = document.getElementById('diametro');
    const inL = document.getElementById('comprimento');

    // Sincroniza o estado com o que está escrito nas caixas (caso o usuário tenha digitado)
    state.diametro = parseFloat(inD.value) || 0;
    state.comprimento = parseFloat(inL.value) || 0;

    const area = calcularArea(state.diametro, state.comprimento);
    const config = obterConfigFaixa(state.diametro);
    const valorBase = area > 0 ? (area * config.fator) + config.k : 0;
    const precoFinal = SERVICOS[state.servico].calculo(valorBase);

    document.getElementById('result-area').textContent = area > 0 ? area.toLocaleString('pt-BR', {minimumFractionDigits: 4, maximumFractionDigits: 4}) : '—';
    document.getElementById('result-faixa').textContent = area > 0 ? config.nome : '—';
    document.getElementById('result-base').textContent = area > 0 ? valorBase.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '—';
    document.getElementById('result-preco').textContent = area > 0 ? precoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0,00';
    document.getElementById('price-service-label').textContent = SERVICOS[state.servico].nome;
}

// FUNÇÃO MESTRE DOS BOTÕES (Delegada para o documento)
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.quick-select button');
    if (btn) {
        e.preventDefault();
        const val = btn.getAttribute('data-value');
        const grupo = btn.closest('.quick-select').id;

        const inD = document.getElementById('diametro');
        const inL = document.getElementById('comprimento');

        if (grupo === 'quick-diametro') {
            inD.value = val;
        } else if (grupo === 'quick-comprimento') {
            inL.value = val;
        }

        atualizarResultados();
    }
});

function initApp() {
    const inD = document.getElementById('diametro');
    const inL = document.getElementById('comprimento');

    if (inD) inD.addEventListener('input', atualizarResultados);
    if (inL) inL.addEventListener('input', atualizarResultados);

    document.querySelectorAll('.service-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.service-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.servico = btn.dataset.service;
            atualizarResultados();
        });
    });

    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (inD) inD.value = '';
            if (inL) inL.value = '';
            state.servico = 'cromoCamada';
            document.querySelectorAll('.service-btn').forEach(b => b.classList.remove('active'));
            const defaultBtn = document.querySelector('[data-service="cromoCamada"]');
            if (defaultBtn) defaultBtn.classList.add('active');
            atualizarResultados();
        });
    }
}

document.addEventListener('DOMContentLoaded', initApp);
console.log("CromCalc v2.2 Carregado com Sucesso!");
