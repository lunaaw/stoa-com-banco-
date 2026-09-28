// --- CONTROLE DE ABAS PRINCIPAIS ---
function showMainTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));

    if (tabName === 'aprendiz') {
    document.body.classList.remove('theme-empresa');
    document.getElementById('tab-aprendiz').classList.add('active');
    document.getElementById('view-aprendiz').classList.add('active');
    } else if (tabName === 'empresas') {
    document.body.classList.add('theme-empresa');
    document.getElementById('tab-empresas').classList.add('active');
    document.getElementById('view-empresas').classList.add('active');
    backToEmpresaMenu();
    }
}

// --- NAVEGAÇÃO INTERNA DA EMPRESA ---
function openEmpresaLogin() {
    document.getElementById('emp-menu').classList.remove('active');
    document.getElementById('emp-login').classList.add('active');
    goToStepEmpresa(1);
}

function backToEmpresaMenu() {
    document.getElementById('emp-login').classList.remove('active');
    document.getElementById('emp-menu').classList.add('active');
}

// Redirecionamento para cadastro.html
function openEmpresaCadastroNotice() {
    window.location.href = 'cadastro.html';
}

// --- FLUXO PASSO A PASSO (APRENDIZ) ---
function goToStepAprendiz(stepNumber) {
    const userInput = document.getElementById('userInputAprendiz');
    const userWrapper = document.getElementById('userWrapperAprendiz');
    
    if (stepNumber === 2) {
    if (!userInput.value.trim()) {
        userWrapper.classList.add('error');
        userInput.focus();
        return;
    }
    }

    document.querySelectorAll('#view-aprendiz .step').forEach(step => step.classList.remove('active'));
    
    if (stepNumber === 1) {
    document.getElementById('step1-aprendiz').classList.add('active');
    userInput.focus();
    } else if (stepNumber === 2) {
    document.getElementById('step2-aprendiz').classList.add('active');
    document.getElementById('passwordInputAprendiz').focus();
    }
}

// --- FLUXO PASSO A PASSO (EMPRESA) ---
function goToStepEmpresa(stepNumber) {
    const userInput = document.getElementById('userInputEmpresa');
    const userWrapper = document.getElementById('userWrapperEmpresa');
    
    if (stepNumber === 2) {
    if (!userInput.value.trim()) {
        userWrapper.classList.add('error');
        userInput.focus();
        return;
    }
    }

    document.querySelectorAll('#emp-login .step').forEach(step => step.classList.remove('active'));
    
    if (stepNumber === 1) {
    document.getElementById('step1-empresa').classList.add('active');
    userInput.focus();
    } else if (stepNumber === 2) {
    document.getElementById('step2-empresa').classList.add('active');
    document.getElementById('passwordInputEmpresa').focus();
    }
}

// --- FUNÇÕES UTILITÁRIAS ---
function clearError(wrapperId) {
    document.getElementById(wrapperId).classList.remove('error');
}

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}

// --- POP-UP / MODAL DINÂMICO ---
function openModal(type) {
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');

    if (type === 'empresa') {
    modalTitle.innerText = "Recuperação de Conta Empresarial";
    modalText.innerText = "Se você perdeu o acesso à conta da empresa ou CNPJ cadastrado, por favor entre em contato com o administrador da conta corporativa ou com o suporte técnico da plataforma.";
    } else {
    modalTitle.innerText = "Recuperação de E-mail (Aprendiz)";
    modalText.innerText = "Se você não se lembra do e-mail cadastrado, entre em contato com a coordenação da sua instituição de ensino para consultar ou atualizar seus dados.";
    }

    document.getElementById('instructionModal').classList.add('active');
}

function closeModal() {
    document.getElementById('instructionModal').classList.remove('active');
}

// --- SUBMISSÃO PARA O SUPABASE ---
function handleFormSubmit(event, type) {
    event.preventDefault();
    
    if (type === 'empresa') {
    const passwordInput = document.getElementById('passwordInputEmpresa');
    const passWrapper = document.getElementById('passWrapperEmpresa');
    if (!passwordInput.value.trim()) {
        passWrapper.classList.add('error');
        passwordInput.focus();
        return;
    }
    alert('Autenticando Empresa no Supabase...');
    } else {
    const passwordInput = document.getElementById('passwordInputAprendiz');
    const passWrapper = document.getElementById('passWrapperAprendiz');
    if (!passwordInput.value.trim()) {
        passWrapper.classList.add('error');
        passwordInput.focus();
        return;
    }
    alert('Autenticando Aprendiz no Supabase...');
    }
}