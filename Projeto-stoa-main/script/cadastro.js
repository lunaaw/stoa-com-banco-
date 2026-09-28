// --- NAVEGAÇÃO ENTRE ETAPAS ---
function goToStep(stepNumber) {
    if (stepNumber === 2) {
    const razaoSocial = document.getElementById('razaoSocial');
    const cnpj = document.getElementById('cnpjInput');
    const email = document.getElementById('emailCadInput');

    let hasError = false;

    if (!razaoSocial.value.trim()) {
        document.getElementById('razosWrapper').classList.add('error');
        hasError = true;
    }
    if (!cnpj.value.trim()) {
        document.getElementById('cnpjWrapper').classList.add('error');
        hasError = true;
    }
    if (!email.value.trim()) {
        document.getElementById('emailCadWrapper').classList.add('error');
        hasError = true;
    }

    if (hasError) return;
    }

    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));

    if (stepNumber === 1) {
    document.getElementById('step1-cad').classList.add('active');
    document.getElementById('razaoSocial').focus();
    } else if (stepNumber === 2) {
    document.getElementById('step2-cad').classList.add('active');
    document.getElementById('phoneInput').focus();
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

// --- SUBMISSÃO E VALIDAÇÃO FINAL ---
function handleRegisterSubmit(event) {
    event.preventDefault();

    const phone = document.getElementById('phoneInput');
    const pass = document.getElementById('passwordCadInput');
    const confirmPass = document.getElementById('confirmPasswordInput');
    const confirmWrapper = document.getElementById('confirmPassWrapper');
    const confirmErrorText = document.getElementById('confirmErrorText');

    let hasError = false;


    if (!pass.value.trim() || pass.value.length < 6) {
    document.getElementById('passCadWrapper').classList.add('error');
    hasError = true;
    }

    if (!confirmPass.value.trim()) {
    confirmErrorText.innerText = "Campo obrigatório. Confirme sua senha.";
    confirmWrapper.classList.add('error');
    hasError = true;
    } else if (pass.value !== confirmPass.value) {
    confirmErrorText.innerText = "As senhas não coincidem.";
    confirmWrapper.classList.add('error');
    hasError = true;
    }

    if (hasError) return;

    alert('Cadastro da empresa realizado com sucesso! Conectando ao Supabase...');
    // Exemplo de integração Supabase:
    // window.location.href = 'login.html';
}