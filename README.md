<p align="center">
  <img src="assets/images/Logo_UniReserva.png" alt="Logo UniReserva" width="200" />
</p>

<h2 align="center"> UniReserva </h2>

<div class="descricao_projeto">
  <h2> Descrição do Projeto </h2>
  <p>Sistema Web para gerenciamento de reservas de salas em instituições educacionais. Projeto acadêmico desenvolvido para a disciplina de Programação Web do curso de Engenharia de Software da instituição Centro Universitário Católica de Santa Catarina.</p>
</div>

<div class="dominio_problema">
  <h2>Domínio do Problema</h2>
  <p>Instituições de ensino frequentemente enfrentam dificuldades no controle de reservas de salas de aula e laboratórios. Muitas vezes o processo é manual, sujeito a conflitos de horário e falta de organização. </p>
  <p align="justify-center">O sistema proposto tem como objetivo permitir que usuários autenticados realizem reservas de salas, consultem disponibilidade e gerenciem suas solicitações de forma organizada e segura.</p>
</div>

<div class="publico_alvo">
  <h2> Público-Alvo</h2>
  <ul>
    <li><p>Professores</p></li>
    <li><p>Coordenadores</p></li>
    <li><p>Estudantes (caso permitido)</p></li>
  </ul>
</div>

<div class="requisitos">
  <h2> Funcionalidades</h2>
  <ul>
    <li><h3>Requisitos Funcionais</h3></li>
    <ul>
      <li><p>RF01 – O sistema deve permitir cadastro de usuário</p></li>
      <li><p>RF02 – O sistema deve permitir login com autenticação por token</p></li>
      <li><p>RF03 - O sistema deve permitir cadastro de salas</p></li>
      <li><p>RF04 - O sistema deve permitir consultar disponibilidade de salas</p></li>
      <li><p>RF05 - O sistema deve permitir realizar reserva de sala</p></li>
      <li><p>RF06 - O sistema deve impedir reservas em horários já ocupados</p></li>
      <li><p>RF07 - O sistema deve permitir cancelar reserva</p></li>
    </ul>
    <li><h3>Requisitos Não Funcionais</h3></li>
    <ul>
      <li><p>RNF01 - O sistema deve seguir arquitetura MVC</p></li>
      <li><p>RNF02 - O sistema deve disponibilizar API REST</p></li>
      <li><p>RNF03 – O sistema deve utilizar banco de dados relacional</p></li>
      <li><p>RNF04 – O sistema deve ser implantado online</p></li>
      <li><p>RNF05 – O sistema deve utilizar controle de acesso com autenticação</p></li>
    </ul>
  </ul>
</div>

<div class="transacao_problema">
  <h2>Transação do Problema</h2>
  <ul>
      <li><p>O sistema verifica se a sala está disponível</p></li>
      <li><p>Caso esteja:</p>
      <ul>
        <li><p>Registra a reserva</p></li>
        <li><p>Marca o horário como ocupado</p></li>
      </li>
      </ul>
        <li><p>Caso não esteja:</p>
      <ul>
        <li><p>Retorna um erro</p></li>
      </ul>
        </li>
  </ul>
  </div>

<div class="modelo_entidade_banco">
  <h2> Modelo Entidade Banco</h2>
  <h4>Usuário</h4>
  <ul>
    <li><p>id</p></li>
    <li><p>nome</p></li>
    <li><p>email</p></li>
    <li><p>senha</p></li>
    <li><p>tipo (admin / comum)</p></li>
  </ul>
    <h4>Sala</h4>
  <ul>
    <li><p>id</p></li>
    <li><p>nome</p></li>
    <li><p>capacidade</p></li>
    <li><p>tipo (laboratório / sala comum)</p></li>
  </ul>
      <h4>Reserva</h4>
  <ul>
    <li><p>id</p></li>
    <li><p>data</p></li>
    <li><p>horário início</p></li>
    <li><p>horário fim</p></li>
    <li><p>id_usuario</p></li>
    <li><p>id_sala</p></li>
    <li><p>status</p></li>
  </ul>
</div>

<div class="tecnologias_utilizadas">
  <h2>Tecnologias Utilizadas</h2>
  <h3>Back-end: Node.js + Express</h3>
  <p>O back-end será desenvolvido utilizando Node.js, com o framework Express.</p>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Ambiente leve e eficiente para construção de APIs REST.</p></li>
    <li><p>Grande adoção no mercado.</p></li>
    <li><p>Facilidade na implementação de rotas, middlewares e autenticação com JWT.</p></li>
    <li><p>Permite organização em padrão MVC.</p></li>
  </ul>
  <br>
  <h3>Banco de Dados: PostgreSQL</h3>
  <p>Será utilizado PostgreSQL como sistema gerenciador de banco de dados relacional.</p>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Banco relacional robusto e open source.</p></li>
    <li><p>Suporte a transações (ACID).</p></li>
    <li><p>Ideal para controle de integridade em reservas (evitar conflitos de horário).</p></li>
    <li><p>Amplamente utilizado em aplicações web.</p></li>
  </ul>
  <br>
  <h3>Front-end: HTML + CSS + JavaScript</h3>
  <p>O front-end será desenvolvido utilizando tecnologias web padrão.</p>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Simplicidade na implementação.</p></li>
    <li><p>Controle total da estrutura e integração com API REST.</p></li>
    <li><p>Evita complexidade de frameworks adicionais.</p></li>
    <li><p>Ideal para foco nos conceitos da disciplina.</p></li>
  </ul>
  <br>
  <h3>Arquitetura</h3>
  <ul>
    <li><p>Arquitetura Cliente-Servidor</p></li>
    <li><p>API REST</p></li>
    <li><p>Padrão MVC no back-end</p></li>
    <li><p>Aplicação monolítica</p></li>
  </ul>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Separação clara entre responsabilidades.</p></li>
    <li><p>Organização do código.</p></li>
    <li><p>Facilita manutenção e escalabilidade futura.</p></li>
  </ul>
  <br>
  <h3>Autenticação</h3>
  <ul>
    <li><p>JWT (JSON Web Token)</p></li>
  </ul>
  <p><b>Justificativa:</b></p>
  <ul>
    <li><p>Controle de acesso baseado em token.</p></li>
    <li><p>Segurança para rotas protegidas.</p></li>
    <li><p>Muito utilizado em APIs modernas.</p></li>
  </ul>
</div>

<div class="arquitetura_c4">
  <h2>Arquitetura C4</h2>
  <p><a href="c4-context.puml">Fonte - Nível 1 (Contexto)</a></p>
  <p><a href="c4-container.puml">Fonte - Nível 2 (Contêiner)</a></p>
  <p><a href="c4-components.puml">Fonte - Nível 3 (Componentes)</a></p>

  <p align="center">
    <img src="assets/images/c4-context.png" alt="Diagrama C4 de contexto do UniReserva" width="900" />
  </p>

  <h3>Nível 1 – Diagrama de Contexto</h3>
  <p>Visão geral do sistema e seus atores externos:</p>
  <ul>
    <li><p><b>Usuário (Professor / Coordenador / Estudante)</b> → interage com o sistema via navegador web para realizar reservas de salas.</p></li>
    <li><p><b>UniReserva (Sistema Web)</b> → processa as solicitações, autentica usuários e gerencia as reservas.</p></li>
    <li><p><b>Banco de Dados (PostgreSQL)</b> → armazena os dados de usuários, salas e reservas.</p></li>
  </ul>

  <h3>Nível 2 – Diagrama de Contêiner</h3>
  <p align="center">
    <img src="assets/images/c4-container.png" alt="Diagrama C4 de contêiner do UniReserva" width="900" />
  </p>
  <p>Componentes principais do sistema:</p>
  <ul>
    <li><p><b>Front-end (HTML + CSS + JavaScript)</b> → interface web executada no navegador do usuário. Consome a API REST.</p></li>
    <li><p><b>Back-end / API REST (Node.js + Express)</b> → responsável pelas regras de negócio, autenticação JWT e comunicação com o banco de dados. Organizado no padrão MVC.</p></li>
    <li><p><b>Banco de Dados (PostgreSQL)</b> → armazena e persiste os dados do sistema.</p></li>
  </ul>

  <h3>Nível 3 – Diagrama de Componentes (Back-end)</h3>
  <p align="center">
    <img src="assets/images/c4-components.png" alt="Diagrama C4 de componentes do UniReserva" width="900" />
  </p>
  <p>Componentes internos da API:</p>
  <ul>
    <li><p><b>Router (Rotas Express)</b> → define os endpoints da API REST e direciona as requisições.</p></li>
    <li><p><b>Controller</b> → recebe as requisições HTTP, chama os serviços e retorna as respostas.</p></li>
    <li><p><b>Service / Model</b> → contém as regras de negócio e realiza as operações no banco de dados.</p></li>
    <li><p><b>Middleware de Autenticação (JWT)</b> → valida o token nas rotas protegidas antes de permitir o acesso.</p></li>
  </ul>

  <h3>Nível 4 – Diagrama de Código (Fluxo de Reserva)</h3>
  <p>Fluxo principal da funcionalidade de reserva de sala:</p>
  <ol>
    <li><p>Usuário envia requisição <code>POST /reservas</code> com data, horário e id da sala.</p></li>
    <li><p>Middleware verifica o token JWT.</p></li>
    <li><p>Controller recebe a requisição e chama o <code>ReservaService</code>.</p></li>
    <li><p>Service consulta o banco para verificar disponibilidade da sala no horário solicitado.</p></li>
    <li><p>Se disponível → registra a reserva e retorna <code>201 Created</code>.</p></li>
    <li><p>Se indisponível → retorna <code>409 Conflict</code> com mensagem de erro.</p></li>
  </ol>
</div>

<div class="entrega_atual">
  <h2>Entrega Atual – Próxima Iteração</h2>
  <p>Nesta etapa, a implementação evoluiu <b>por ambos</b>: front-end e back-end, com integração real ao PostgreSQL e preparação de demo local.</p>

  <h3>Artefatos Disponíveis no Repositório</h3>
  <ul>
    <li><p><b>Front-end:</b> interface inicial em <code>public/index.html</code>, <code>public/styles.css</code> e <code>public/app.js</code>.</p></li>
    <li><p><b>Back-end:</b> API REST em Node.js + Express, organizada em estrutura inspirada em MVC dentro da pasta <code>src</code>.</p></li>
    <li><p><b>Banco de dados:</b> schema em <code>db/schema.sql</code>, seed em <code>db/seed.sql</code> e script de inicialização em <code>scripts/initDb.js</code>.</p></li>
    <li><p><b>Demo local:</b> configuração de ambiente em <code>.env.example</code> e serviço PostgreSQL em <code>docker-compose.yml</code>.</p></li>
    <li><p><b>Arquitetura C4:</b> fontes em <code>c4-context.puml</code>, <code>c4-container.puml</code> e <code>c4-components.puml</code>; imagens em <code>assets/images/c4-context.png</code>, <code>assets/images/c4-container.png</code> e <code>assets/images/c4-components.png</code>.</p></li>
    <li><p><b>Teste automatizado:</b> fluxo principal validado em <code>test/api.test.js</code>.</p></li>
  </ul>

  <h3>Escopo Implementado Nesta Entrega</h3>
  <ul>
    <li><p>Autenticação com geração e validação de token JWT.</p></li>
    <li><p>Consulta de salas disponíveis a partir do PostgreSQL.</p></li>
    <li><p>Criação de reservas com validação de conflito de horário no banco.</p></li>
    <li><p>Cancelamento de reservas com controle básico de permissão.</p></li>
    <li><p>Interface web inicial para demonstrar o fluxo principal da aplicação.</p></li>
    <li><p>Scripts para inicialização da base e preparação de demo local.</p></li>
  </ul>

  <h3>Ajustes de Requisitos Identificados</h3>
  <ul>
    <li><p><b>AR01:</b> o requisito RNF03 foi atendido nesta iteração com integração real ao PostgreSQL, incluindo schema, seed e script de inicialização.</p></li>
    <li><p><b>AR02:</b> o requisito RF02 foi detalhado como autenticação via JWT com proteção das rotas privadas da API.</p></li>
    <li><p><b>AR03:</b> o requisito RF06 foi detalhado com a regra de conflito por sala, data e sobreposição de horários.</p></li>
    <li><p><b>AR04:</b> para facilitar a avaliação local, foi incluída uma estratégia de demo com <code>docker-compose</code> e variáveis em <code>.env.example</code>.</p></li>
  </ul>

  <h3>Estrutura Inicial do Projeto</h3>
  <ul>
    <li><p><code>src/controllers</code> → recebe as requisições HTTP e retorna respostas.</p></li>
    <li><p><code>src/services</code> → concentra regras de negócio.</p></li>
    <li><p><code>src/repositories</code> → executa consultas SQL no PostgreSQL.</p></li>
    <li><p><code>src/routes</code> → define endpoints da API REST.</p></li>
    <li><p><code>src/middleware</code> → valida autenticação e permissões.</p></li>
    <li><p><code>src/config</code> → centraliza conexão com banco e bootstrap da base.</p></li>
    <li><p><code>db</code> → guarda os scripts SQL de schema e seed.</p></li>
    <li><p><code>scripts</code> → contém scripts auxiliares, como inicialização do banco.</p></li>
    <li><p><code>public</code> → contém a interface web inicial.</p></li>
  </ul>

  <h3>Como Executar</h3>
  <ol>
    <li><p>Copiar <code>.env.example</code> para um arquivo <code>.env</code> e ajustar as variáveis se necessário.</p></li>
    <li><p>Instalar dependências com <code>npm.cmd install</code>.</p></li>
    <li><p>Subir o PostgreSQL com <code>npm.cmd run db:up</code> (requer Docker instalado).</p></li>
    <li><p>Inicializar schema e seed com <code>npm.cmd run db:init</code>.</p></li>
    <li><p>Iniciar a aplicação com <code>npm.cmd start</code>.</p></li>
    <li><p>Acessar <code>http://localhost:3000</code> no navegador.</p></li>
  </ol>

  <h3>Validação da Entrega</h3>
  <ul>
    <li><p>Os testes automatizados passam com <code>npm.cmd test</code>.</p></li>
    <li><p>O comando <code>npm.cmd start</code> sobe a aplicação localmente.</p></li>
    <li><p>Neste ambiente de edição, o Docker não está instalado; por isso, a subida real do container PostgreSQL deve ser executada localmente na máquina com Docker disponível.</p></li>
  </ul>

  <h3>Usuários de Demonstração</h3>
  <ul>
    <li><p><b>Administrador:</b> <code>admin@unireserva.com</code> / <code>admin123</code></p></li>
    <li><p><b>Professor:</b> <code>professor@unireserva.com</code> / <code>prof123</code></p></li>
  </ul>
</div>
<div style="display: inline_block"><br>
  <img align="center" alt="FIGMA" height="30" width="40" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" />
  <img align="center" alt="GITHUB" height="40" width="40"src="https://cdn.iconscout.com/icon/free/png-256/github-2690381-2232884.png" />
  <img  align="center" alt="VSCODE" height="35" width="30" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" />
  <img align="center" alt="NOTION" height="40" width="40" src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"/>
  <img align="center" alt="JAVASCRIPT" height="40" width="40" src="https://img.icons8.com/?size=100&id=108784&format=png&color=000000.png"/>
  <img align="center" alt="HTML" height="40" width="40" src="https://img.icons8.com/?size=100&id=v8RpPQUwv0N8&format=png&color=000000.png"/>
  <img align="center" alt="POSTGRESQL" height="40" width="40" src="https://img.icons8.com/?size=100&id=JRnxU7ZWP4mi&format=png&color=000000.png"/>
  <img align="center" alt="POSTGRESQL" height="40" width="40" src="https://img.icons8.com/?size=100&id=21278&format=png&color=000000.png"/>
  </div>
