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

// MVP limitado à TOTVS: o cadastro de novas empresas está indisponível.
function openEmpresaCadastroNotice() {
    const title = document.getElementById('modalTitle');
    const description = document.getElementById('modalText');
    if (title && description) {
        title.textContent = 'Cadastro empresarial indisponível';
        description.textContent = 'Nesta versão de demonstração, a STOA atende somente à empresa TOTVS. Novos cadastros empresariais não estão disponíveis. Se você já possui uma conta, utilize Login Empresa.';
        document.getElementById('instructionModal')?.classList.add('active');
        return;
    }
    window.location.href = '../cadastro/cadastro.html';
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

// --- AUTENTICAÇÃO REAL + ROTEAMENTO PELO PERFIL VALIDADO NO BANCO ---
const STOA_ROUTES = Object.freeze({
    aprendiz: '../aprendiz/aprendiz.html',
    gestor: '../gestor/gestor.html',
    empresa: '../cadastro-equipe/cadastro_equipe.html',
    admin: '../cadastro-equipe/cadastro_equipe.html',
    equipe: '../gestor/gestor.html'
});

async function handleFormSubmit(event, type) {
    event.preventDefault();
    const suffix = type === 'empresa' ? 'Empresa' : 'Aprendiz';
    const emailInput = document.getElementById('userInput' + suffix);
    const passwordInput = document.getElementById('passwordInput' + suffix);
    const emailWrapper = document.getElementById('userWrapper' + suffix);
    const passWrapper = document.getElementById('passWrapper' + suffix);
    const form = document.getElementById('loginForm' + suffix);
    const button = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
        if (type === 'empresa') goToStepEmpresa(1);
        else goToStepAprendiz(1);
        emailWrapper.classList.add('error');
        emailInput.focus();
        return;
    }
    if (!password) {
        passWrapper.classList.add('error');
        passwordInput.focus();
        return;
    }
    try {
        button.disabled = true;
        button.textContent = 'Entrando...';
        const user = await window.STOA.auth.signInWithPassword(email, password);
        if (!user || window.STOA.auth.isDemoUser(user)) {
            throw new Error('Use uma conta real cadastrada no Supabase Auth.');
        }
        const profile = await window.STOA.auth.getCurrentProfile();
        const allowed = type === 'aprendiz'
            ? profile?.tipo === 'aprendiz'
            : ['empresa', 'gestor', 'admin', 'equipe'].includes(profile?.tipo);
        if (!allowed) {
            await window.STOA.auth.signOut();
            throw new Error(type === 'aprendiz'
                ? 'Esta conta não é de jovem aprendiz. Utilize o acesso empresarial.'
                : 'Esta conta é de jovem aprendiz. Utilize a aba Jovem Aprendiz.');
        }
        const route = STOA_ROUTES[profile?.tipo];
        if (!route) throw new Error('Perfil sem acesso configurado.');
        window.location.replace(route);
    } catch (error) {
        console.error('Falha no login STOA:', error);
        passWrapper.classList.add('error');
        const msg = passWrapper.querySelector('.error-message');
        if (msg) msg.textContent = error.message?.includes('Esta conta') ? error.message : 'Não foi possível entrar. Confira suas credenciais e o perfil cadastrado.';
        passwordInput.focus();
    } finally {
        button.disabled = false;
        button.textContent = 'Entrar';
    }
}
