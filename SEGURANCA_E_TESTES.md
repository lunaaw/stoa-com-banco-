# STOA | Segurança da versão local

## Controles implementados
- Login Supabase Auth e autorização de páginas por perfil.
- RLS nas tabelas operacionais do Supabase; tabelas legadas sem acesso `anon` ou `authenticated`.
- Todas as rotas POST dos 3 projetos FastAPI exigem um JWT válido conferido no Supabase Auth **e** o perfil `aprendiz` consultado no banco sob RLS.
- Chamadas do navegador enviam o token de sessão automaticamente, inclusive uploads de planilha e áudio.
- O servidor mantém a chave Gemini fora do frontend; não há necessidade de `service_role` na FastAPI.
- Rota `/health` permanece sem autenticação e não deve revelar dados pessoais.

## Como rodar
Execute o frontend na raiz do projeto com `py -m http.server 5500 --bind 127.0.0.1`.
Para o primeiro projeto, em outro terminal, execute `cd projetos/etapa-1/backend` e `py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000`.
Para os demais projetos, pare o backend anterior e inicie `main:app` no diretório de backend correspondente na porta 8000.
As configurações da API Gemini permanecem nos `.env` locais e não são distribuídas neste ZIP.

## Testes obrigatórios no navegador
1. Como aprendiz, abra a Etapa 1 e verifique o chat/upload e avaliação. Uma requisição sem cabeçalho `Authorization` deve resultar em HTTP 401.
2. Com uma sessão de gestor ou RH, envie uma requisição ao mesmo endpoint: deve retornar HTTP 403.
3. Abra a página do gestor logada como aprendiz: deve redirecionar, sem consultar dados administrativos.
4. Logada como Marina, confirme que só há jovens associados à Marina, e que outro gestor não consegue ler seus resultados.
5. Teste cadastro de usuário novo pelo RH, usando e-mail **não existente**. Confirme perfil, equipe e identidade no Supabase Auth. Não teste com os 13 usuários já existentes para não duplicar contas.
6. Confira que nenhum arquivo `.env` nem senha fictícia foi publicado no GitHub; troque as senhas compartilhadas antes de disponibilizar para terceiros.

## Limites / pendências antes de produção
- Os testes automatizados desta entrega comprovam a rejeição de chamadas anônimas e de perfis distintos por meio de mocks, mas NÃO substituem testes reais autenticados no navegador.
- A proteção contra senhas vazadas deve ser habilitada no painel Supabase Auth quando disponível no plano.
- Uma senha legítima compartilhada continua permitindo login; é necessário redefini-la e utilizar credenciais individuais.
- `localhost` restringe o serviço ao computador, mas não é isolamento offline: Auth e Gemini usam serviços externos.
- A chave pública/publishable (anon) do Supabase pode aparecer no frontend; **service_role** e `GEMINI_API_KEY` nunca devem aparecer nele.
- Antes de hospedar publicamente, adicionar limites de uso/rate limiting, monitoramento e política de retenção de dados.
