
# STOA | Plataforma de Desenvolvimento de Jovens Aprendizes


**STOA - MVP FINAL PARA O PROGRAMA START TECH** 

## 👨‍🎓 Integrantes

- [Esther Barreto]((https://www.linkedin.com/in/estherbarreto?utm_source=share_via&utm_content=profile&utm_medium=member_android))
- [Luna Ramos]((https://www.linkedin.com/in/geovanna-luna-873b3532b?utm_source=share_via&utm_content=profile&utm_medium=member_android
))
- [Stefane Queiroz]((https://www.linkedin.com/in/stefane-queiroz-603176358?utm_source=share_via&utm_content=profile&utm_medium=member_android))
- [Sabrina Oliveira]((https://www.linkedin.com/in/sabrinacarlaoliveira?utm_source=share_via&utm_content=profile&utm_medium=member_android))


## 📜 Descrição

A **STOA** é uma plataforma educacional desenvolvida para apoiar a capacitação prática e o acompanhamento de **jovens aprendizes** no ambiente corporativo. O projeto nasceu da percepção de que, embora os programas de aprendizagem proporcionem oportunidades de ingresso no mercado de trabalho, nem sempre os jovens encontram atividades estruturadas, feedbacks consistentes, oportunidades de desenvolvimento do letramento em inteligência artificial ou visibilidade clara sobre sua evolução profissional.

A plataforma busca aproximar três participantes dessa jornada: **Recursos Humanos (RH)**, **gestores** e **jovens aprendizes**. O RH administra os cadastros e os vínculos entre gestores e aprendizes; os gestores acompanham os jovens sob sua responsabilidade, consultam o progresso e os resultados das atividades; e os aprendizes acessam uma trilha de desenvolvimento composta por desafios que estimulam competências técnicas e comportamentais.

A trilha funcional do MVP é **Ferramentas do dia a dia e Comunicação**, voltada ao uso de ferramentas digitais no ambiente corporativo, à organização de informações e ao desenvolvimento da comunicação profissional. Dentro dela, estão o **Mini Projeto Técnico**, o **Mini Projeto de Comunicação** e o **Projeto Integrador**. O fluxo reúne atividades práticas, entregas e avaliações apoiadas pela **inteligência artificial generativa**, que produz feedbacks fundamentados sobre o desempenho do aprendiz, destacando seus acertos, dificuldades e oportunidades de melhoria. A plataforma também incentiva o uso crítico e consciente da IA, estimulando os jovens a compreenderem suas possibilidades e limitações. O sistema registra o progresso independentemente da disponibilidade da IA, evitando que eventuais limitações de cota comprometam a evolução já realizada.

O projeto também apresenta elementos de **gamificação**, como a personalização de avatares e o desbloqueio de recompensas vinculadas à conclusão individual dos mini projetos. Na interface, outros dois cursos, **Git e GitHub** e **Integração e Cultura**, permanecem como componentes demonstrativos do catálogo: o primeiro está bloqueado e o segundo aparece visualmente finalizado. Esses estados fixos não representam resultados individuais reais.

O MVP utiliza **HTML, CSS e JavaScript** no frontend, **Python e FastAPI** nos serviços das atividades, **Supabase Auth e PostgreSQL** para autenticação e persistência de dados e **Google Gemini** como suporte às avaliações. O desenvolvimento também contempla medidas de **cibersegurança**, como autenticação de usuários, separação de perfis, políticas de controle de acesso ao banco de dados e proteção de endpoints, visando preservar a confidencialidade e a integridade das informações.

Nesta versão acadêmica, a **TOTVS foi escolhida como empresa de referência para o desenvolvimento e a demonstração da STOA**, considerando que o projeto foi desenvolvido no contexto do programa **Start Tech, oferecido pela TOTVS em parceria com a FIAP**. Por esse motivo, o MVP contempla exclusivamente essa empresa, permitindo direcionar as funcionalidades às necessidades de capacitação e acompanhamento de jovens aprendizes em um cenário corporativo inspirado em sua realidade. Os usuários e seus dados de demonstração são fictícios, e a STOA não constitui um produto oficial da TOTVS nem representa uma parceria institucional específica para o desenvolvimento da plataforma.

O objetivo da STOA é demonstrar como uma experiência estruturada de aprendizagem, aliada ao uso consciente da inteligência artificial, à gamificação e ao acompanhamento contínuo, pode contribuir para o desenvolvimento técnico e comportamental dos jovens aprendizes, tornando sua evolução mais **visível, prática, personalizada e orientada à melhoria contínua**.



## 🎯 Objetivos do projeto

- Organizar atividades práticas de aprendizagem em uma plataforma única.
- Estimular letramento digital, uso crítico da IA e competências comportamentais.
- Permitir que gestores acompanhem a evolução dos aprendizes vinculados à sua equipe.
- Oferecer feedbacks compreensíveis sobre entregas, acertos e pontos de melhoria.
- Registrar resultados e progresso por usuário no banco de dados.
- Demonstrar autenticação, autorização e medidas de segurança aplicadas a um MVP educacional.

## 👥 Perfis de acesso

| Perfil | Responsabilidades no MVP |
|---|---|
| **Empresa / RH** | Visualizar e cadastrar gestores e aprendizes, manter vínculos empresariais e consultar o catálogo demonstrativo. |
| **Gestor** | Acompanhar os aprendizes de sua equipe, visualizar progresso e feedbacks registrados. O checklist demonstrativo de atribuições não bloqueia atividades. |
| **Jovem Aprendiz** | Realizar mini projetos, acompanhar a trilha, consultar resultados e personalizar o avatar conforme as recompensas liberadas. |

**Regra importante:** apenas a trilha **Ferramentas do dia a dia e Comunicação** possui progresso individual real nesta versão. As demais opções do catálogo mantêm estados visuais fixos.

## ✨ Funcionalidades

- Login com contas autenticadas pelo Supabase Auth e acesso por perfil.
- Cadastro de gestores e aprendizes feito pelo RH, com persistência no Supabase.
- Associação de aprendizes à empresa e ao gestor responsável.
- Projetos práticos com arquivos, chat e avaliação por IA, conforme a atividade.
- Progresso individual persistente, separado por aprendiz e mini projeto.
- Feedbacks armazenados quando a avaliação da IA é produzida com sucesso.
- Consulta de progresso e feedbacks pelo gestor responsável.
- Avatares personalizáveis e desbloqueios por conclusão de mini projetos.
- Proteção de endpoints FastAPI para sessões autenticadas de aprendizes.

## 🧱 Tecnologias e arquitetura

| Camada | Tecnologia | Utilização |
|---|---|---|
| Interface | HTML5, CSS3 e JavaScript | Navegação, formulários, painéis, trilha e atividades. |
| Serviços | Python, FastAPI e Uvicorn | Processamento das entregas, chats, uploads e avaliações. |
| Autenticação | Supabase Auth | Login, sessões e identidade dos usuários. |
| Banco de dados | Supabase PostgreSQL | Perfis, equipes, progresso, feedbacks e gamificação. |
| IA generativa | API Google Gemini | Suporte às avaliações e orientações das atividades. |
| Integração | Supabase JS e APIs HTTP | Comunicação entre frontend, serviços e banco. |
| Versionamento | Git e GitHub | Organização do código e colaboração. |

### Fluxo simplificado da arquitetura

```text
Navegador (HTML/CSS/JavaScript)
  ├── Supabase Auth → identidade e sessão
  ├── Supabase PostgreSQL → dados permitidos pelas políticas RLS
  └── FastAPI → valida sessão/perfil → processa atividade → Gemini (quando disponível)
                                            └── frontend registra resultado no Supabase
```

As chaves administrativas do Supabase e a chave da API Gemini **não devem** ser expostas no frontend. A chave pública (`anon`/publishable) do Supabase não substitui políticas de autorização.

## 📁 Estrutura de pastas

A estrutura abaixo representa os diretórios efetivamente utilizados na versão do MVP:

```text
STOA_MVP_final/
├── assets/
│   └── img/                  # Logos e recursos visuais
├── pages/
│   ├── login/                # Autenticação e escolha de acesso
│   ├── aprendiz/             # Painel do jovem aprendiz
│   ├── gestor/               # Painel de acompanhamento do gestor
│   ├── cadastro-equipe/      # Gestão de gestores pelo RH
│   ├── cadastro-aprendiz/    # Gestão de aprendizes pelo RH
│   ├── cadastro/             # Cadastro empresarial indisponível no MVP
│   ├── projetos/             # Catálogo de cursos e projetos
│   ├── trilha/               # Evolução da trilha funcional
│   ├── avatar/               # Personalização e gamificação
│   └── rh/                   # Arquivos de suporte à área administrativa
├── projetos/
│   ├── etapa-1/
│   │   ├── frontend/
│   │   └── backend/          # Mini Projeto Técnico
│   ├── etapa-2/
│   │   ├── frontend/
│   │   └── backend/          # Mini Projeto de Comunicação
│   └── projeto-integrador/
│       ├── frontend/
│       └── backend/          # Projeto Integrador
├── shared/
│   ├── css/                  # Estilos compartilhados
│   └── js/
│       └── database/         # Autenticação, cliente Supabase e persistência
├── GUIA_LOCALHOST_STOA.txt   # Instruções locais adicionais
├── SEGURANCA_E_TESTES.md     # Escopo de segurança e testes
├── .gitignore                # Exclusões do versionamento
└── README.md                 # Documentação do projeto
```

> O modelo acadêmico cita pastas `.github`, `config`, `document`, `scripts` e `src`, mas elas não são obrigatórias nesta estrutura. Não foram inventadas no diagrama, pois o código atual está organizado em `pages`, `projetos` e `shared`.

## 🔧 Como executar o código

### 1. Pré-requisitos

- **Git** e um editor, como **Visual Studio Code**.
- **Python 3.11 ou superior**, com `pip` e `venv` disponíveis.
- Navegador atualizado.
- Conexão com a internet para autenticação e banco Supabase; para avaliações por IA, acesso ao Gemini e cota de API disponível.
- Credenciais de uma **conta de demonstração autorizada**.
- Configuração local válida de `GEMINI_API_KEY` para funcionalidades que utilizam IA.

### 2. Obter o código

Clone a branch que contém a versão integrada:

```bash
git clone -b reestruturacao-stoa https://github.com/lunaaw/stoa-com-banco-.git
cd stoa-com-banco-
```

> Se o projeto já foi baixado em ZIP, basta descompactar e abrir a pasta raiz no VS Code.

### 3. Iniciar o frontend

No terminal, na **raiz** do repositório:

```powershell
py -m http.server 5500 --bind 127.0.0.1
```

Acesse:

**http://127.0.0.1:5500/pages/login/login.html**

Não abra os arquivos diretamente com `file://`, pois isso pode prejudicar importações e requisições. O servidor local não torna a STOA pública na internet.

### 4. Preparar o backend de cada atividade

Abra **outro terminal**. Para o Mini Projeto Técnico, execute:

```powershell
cd projetos/etapa-1/backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Crie um arquivo chamado `.env` **nessa pasta de backend**, contendo as variáveis necessárias:

```dotenv
GEMINI_API_KEY=SUA_CHAVE_GEMINI_AQUI
```

A chave deve ser obtida no ambiente Google AI Studio, conforme o acesso e as políticas do serviço.

**Nunca publique a chave no GitHub.**

Não é necessário colocar a chave `service_role` do Supabase nos backends das atividades.

Inicie a API:

```powershell
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

A documentação interativa estará em:

**http://127.0.0.1:8000/docs**

A interface da atividade pode ser aberta a partir da própria STOA ou diretamente em:

**http://127.0.0.1:5500/projetos/etapa-1/frontend/index.html**

É necessário estar autenticado como aprendiz.

### 5. Executar os demais projetos

Para testar o **Mini Projeto de Comunicação** ou o **Projeto Integrador**:

1. Pare o backend anterior utilizando `Ctrl+C`.
2. Acesse `projetos/etapa-2/backend` ou `projetos/projeto-integrador/backend`.
3. Instale as dependências do respectivo `requirements.txt`.
4. Configure o `.env` local.
5. Inicie `main:app` na porta `8000`.

> Nesta configuração de desenvolvimento, os três backends são executados **um de cada vez na mesma porta**. Para hospedar todos simultaneamente, será necessário configurar serviços e endereços distintos.

### 6. Testar a aplicação

1. Entre como aprendiz e abra a trilha **Ferramentas do dia a dia e Comunicação**.
2. Inicie ou retome um mini projeto e confirme o salvamento do progresso.
3. Caso o Gemini esteja disponível, gere uma avaliação e confira o feedback.
4. Entre como gestor e confira a equipe, o progresso individual e os feedbacks efetivamente gerados.
5. Verifique os recursos de gamificação liberados por conclusão real das atividades.
6. Entre como RH e consulte a gestão de equipes e aprendizes, **sem criar contas duplicadas**.


## 🔑 Contas de demonstração

Para facilitar a exploração da STOA, disponibilizamos contas fictícias de jovens aprendizes e de um gestor, permitindo que professores, avaliadores e demais interessados conheçam as funcionalidades da plataforma.

> ⚠️ **ATENÇÃO: AMBIENTE EXCLUSIVAMENTE DEMONSTRATIVO**
>
> A STOA é um **MVP acadêmico**, desenvolvido para fins educacionais, de apresentação e de testes.
>
> **Todos os usuários, nomes, vínculos empresariais e dados disponibilizados nesta demonstração são fictícios.**
>
> As credenciais abaixo são públicas e destinam-se exclusivamente à experimentação da plataforma. Não devem ser utilizadas para armazenar informações pessoais, documentos reais ou dados confidenciais.
>
> Nesta versão, o cadastro de novas empresas está desativado e a criação de aprendizes depende de uma conta administrativa do RH. Por isso, disponibilizamos usuários previamente cadastrados para que seja possível testar a aplicação sem precisar criar uma conta.
>
> Como essas contas são compartilhadas, alterações de avatar, progresso e atividades podem ser visualizadas por outros visitantes. Os dados demonstrativos poderão ser modificados ou redefinidos durante os testes.

### 👨‍🎓 Acesso como Jovem Aprendiz

| Nome | E-mail | Senha |
|---|---|---|
| José Vitor | `jose.vitor@example.com` | `Stoa!J28vD5#y` |
| Ana Morrison | `ana.morrison@example.com` | `Stoa#A74mC9@r` |
| Lana Hendrix | `lana.hendrix@example.com` | `Stoa@H46xN2!t` |
| Gabriel Martins | `gabriel.martins@example.com` | `Stoa!G85bQ3#v` |
| Lucas Almeida | `lucas.almeida@example.com` | `Stoa#U39aZ6!m` |
| Diego Andrade | `diegoandrade@example.com` | `Stoa#E84teste#` |

Ao acessar como aprendiz, é possível:

- Explorar o painel individual e a trilha de aprendizagem.
- Realizar os mini projetos disponíveis.
- Acompanhar o progresso das atividades.
- Consultar feedbacks gerados pela inteligência artificial, quando disponíveis.
- Personalizar o avatar e testar os recursos de gamificação.

### 👨‍💼 Acesso como Gestor

| Nome | E-mail | Senha |
|---|---|---|
| Pedro Nogueira | `pedro.nogueira.gestor@example.com` | `Stoa@P63nV8!s` |

Ao acessar como gestor, é possível:

- Visualizar os aprendizes vinculados à sua equipe.
- Acompanhar o progresso individual dos jovens.
- Consultar as avaliações e os feedbacks disponíveis.
- Explorar os indicadores de acompanhamento da plataforma.

**Observação:** a conta de gestor possui permissões mais amplas que as contas de aprendiz, mas não representa acesso administrativo ao RH.

### 🚀 Como acessar

1. Execute a STOA localmente seguindo as instruções da seção **Como executar o código**.
2. Acesse `http://127.0.0.1:5500/pages/login/login.html`.
3. Selecione o tipo de acesso desejado:
   - **Jovem Aprendiz:** utilize uma das contas de aprendiz.
   - **Empresarial:** utilize a conta demonstrativa do gestor.
4. Informe o e-mail e a senha correspondentes.
5. Explore as funcionalidades disponíveis para o perfil selecionado.

### ⚠️ Limitações da demonstração

- As contas são compartilhadas e não representam usuários reais.
- O progresso e as personalizações podem ter sido modificados por testes anteriores.
- Algumas funcionalidades dependem da disponibilidade da API do Google Gemini e de sua cota de utilização.
- O ambiente utiliza dados fictícios e não deve receber informações pessoais ou documentos confidenciais.
- A disponibilização dessas credenciais é exclusiva do contexto acadêmico do MVP.
- O acesso poderá ser restringido, alterado ou desativado após o período de avaliação.


## 🔒 Cibersegurança e privacidade

Os mecanismos contemplados no MVP incluem:

- **Autenticação:** sessões gerenciadas pelo Supabase Auth.
- **Autorização por perfil:** RH, gestor e aprendiz utilizam interfaces e permissões diferentes.
- **RLS (Row Level Security):** restrições no banco para leitura e escrita segundo o usuário autenticado.
- **Proteção dos endpoints:** rotas de processamento das atividades verificam o token e o perfil de aprendiz.
- **Segurança de segredos:** arquivos `.env`, senhas administrativas e chaves privadas devem permanecer fora do GitHub.
- **Rastreabilidade:** progresso e feedbacks são associados a usuários e projetos no banco.

A documentação de escopo e verificações está em [`SEGURANCA_E_TESTES.md`](SEGURANCA_E_TESTES.md).

A implementação de controles não equivale a uma auditoria independente, nem torna automaticamente o aplicativo adequado a dados reais ou produção.

## 🧪 Estado do MVP e limitações conhecidas

- O desenvolvimento e a validação principal foram realizados em **localhost**. O GitHub hospeda o código, **não** executa os três backends.
- O Supabase e o Gemini dependem de serviços externos e conexão com a internet.
- O Gemini pode atingir limites de uso. O progresso salvo permanece, mas não é criado um feedback fictício quando a avaliação falha.
- O primeiro curso possui progresso real; **Git e GitHub** permanece bloqueado e **Integração e Cultura** aparece visualmente finalizado para todos.
- Os desbloqueios de gamificação são vinculados à conclusão individual dos mini projetos, conforme o progresso persistido.
- O checklist de atribuição no painel do gestor é demonstrativo e não impede o acesso dos aprendizes às atividades.
- O registro de feedback preserva o resultado mais recente por aprendiz e mini projeto nesta versão.
- O cadastro público de empresas está indisponível. A empresa TOTVS utilizada nos testes é fictícia neste contexto de demonstração.
- Antes de publicar o aplicativo na internet, revisar CORS, variáveis de ambiente, limites de uso, gestão de credenciais e testes de autorização entre perfis.

## 🚀 Melhorias futuras

- Hospedagem do frontend e dos três serviços FastAPI em ambiente acessível pela internet.
- Expansão do catálogo com novas trilhas e cursos funcionais.
- Histórico de múltiplas tentativas e avaliações por atividade.
- Gestão de acessos demonstrativos, recuperação de senha e políticas adicionais de segurança.
- Relatórios analíticos mais completos para RH e gestores.
- Monitoramento operacional e testes automatizados ponta a ponta.

## 📚 Documentação complementar

- [`GUIA_LOCALHOST_STOA.txt`](GUIA_LOCALHOST_STOA.txt): orientações resumidas para execução local. Algumas observações do guia podem se referir a versões anteriores; priorize as instruções deste README.
- [`SEGURANCA_E_TESTES.md`](SEGURANCA_E_TESTES.md): segurança, validações e cuidados antes da hospedagem.

## 📄 Créditos e uso acadêmico

Projeto desenvolvido para fins educacionais. Os nomes de usuários utilizados na demonstração são fictícios.

A marca TOTVS é utilizada como **referência de cenário**, sem implicar afiliação, endosso ou parceria institucional.

