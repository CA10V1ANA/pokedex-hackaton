# 🔴 Pokédex — Pokémon Explorer (Hackathon Edition)

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)](https://ca10v1ana.github.io/pokedex-hackaton/)

Uma **Pokédex moderna, performática e responsiva**, desenvolvida com **Angular 19**, **Signals**, novo **Control Flow** (`@if`, `@for`, `@switch`) e consumindo em tempo real a [PokéAPI](https://pokeapi.co/).

🌐 **Live Demo:** [https://ca10v1ana.github.io/pokedex-hackaton/](https://ca10v1ana.github.io/pokedex-hackaton/)

---

## ✨ Funcionalidades em Destaque

### 🎨 Design System Pastel & Dinâmico ("Type-Driven")
- **Degradê Claro Pastel**: Os cartões e páginas usam tons pastéis suaves derivados da cor oficial do tipo primário do Pokémon (`color.mix`), garantindo um visual leve, fresco e elegante.
- **Tipografia Escura & Contraste WCAG**: Textos e IDs com alto contraste em cinza grafite (`#1a202c`) com pesos nítidos.
- **Badges Oficiais Multi-Tipo**: Cada Pokémon exibe seus tipos com suas cores originais de RPG (ex: Bulbasaur com badge verde para *Grass* e roxa para *Poison*).
- **Glassmorphism & Micro-interações**: Efeito de vidro fosco (`backdrop-filter: blur`), marca d'água sutil de Pokébola e animações suaves ao passar o mouse.

### 🔍 Exploração, Busca e Filtros Avançados
- **Busca Global em Tempo Real**: Filtre instantaneamente por nome ou número (#0001, #0025) com `debounceTime`.
- **Filtro Lateral Deslizante (*Side Drawer*)**: Drawer lateral suave com backdrop blur para seleção dos 18 tipos elementais sem empurrar ou quebrar a grade de cartões.
- **Filtro com 1 Clique nas Badges**: Clique diretamente na etiqueta de tipo de qualquer card para filtrar a Pokédex por aquele tipo.
- **Paginação Completa**: Navegação rápida entre as páginas com saltos de 20 Pokémon por página.

### ❤️ Sistema de Favoritos com Persistência
- **Armazenamento Reativo com Angular Signals**: `FavoritesService` gerencia o estado global de favoritos e sincroniza com o `localStorage`.
- **Filtro Rápido no Cabeçalho**: Botão de alternância `❤️ Favoritos (N)` com contador em tempo real.
- **Corações Interativos**: Presentes nos cards da grade, no Quick View lateral e na página de detalhes.

### ⚡ Quick View & Página Dedicada (`/pokemon/:id`)
- **Painel Quick View Lateral**: Pré-visualização instantânea dos 6 atributos base (HP, Atk, Def, Sp. Atk, Sp. Def, Speed), peso, altura e habilidades sem sair da listagem.
- **Página Especializada de Detalhes**: Visão imersiva com navegação em cápsula flutuante (`← Voltar à Pokédex`), atalhos de teclado (seta esquerda/direita) e paginação direta entre Pokémon.
- **Barras de Status Contextuais RPG**:
  - 🟢 **Verde Esmeralda (≥ 100)**: Atributo excelente
  - 🔵 **Azul Cobalto (≥ 75)**: Atributo forte
  - 🟡 **Âmbar Quente (≥ 50)**: Atributo médio
  - 🔴 **Coral Suave (< 50)**: Atributo base baixo

### 🛡️ Resiliência & UX
- **Skeleton Shimmer Loading**: Efeito visual de carregamento na grade e nos detalhes, prevenindo layout shifts.
- **Empty States Ilustrados**: Feedbacks amigáveis ao buscar um Pokémon inexistente ou quando não há favoritos salvos.

---

## 🏗️ Arquitetura e Engenharia de Software

```
src/app/
├── core/
│   └── services/
│       ├── poke-api.service.ts       # Comunicação HTTP com PokeAPI e caching
│       ├── poke-api.service.spec.ts  # Testes de integração da API
│       ├── favorites.service.ts      # Gerenciamento reativo de favoritos com Signals
│       └── favorites.service.spec.ts # Testes unitários do serviço de favoritos
├── models/
│   ├── pokemon.model.ts              # Modelos tipados e RemoteData<T>
│   ├── pokemon.mapper.ts             # Mappers funcionais puros (DTO -> ViewModel)
│   ├── pokemon.mapper.spec.ts        # Testes de mapeamento e cálculos
│   ├── pagination.model.ts           # Lógica pura de paginação
│   └── pagination.spec.ts            # Testes de páginas e limites
├── components/
│   ├── pokemon-card/                 # Componente Dumb de card com degradê pastel
│   └── quick-view/                   # Painel lateral deslizante de pré-visualização
├── pages/
│   ├── pokedex/                      # Página principal (Smart Component)
│   └── pokemon-detail/               # Página de detalhes (/pokemon/:id)
├── styles/
│   └── _pokemon-types.scss           # Dicionário de cores oficiais dos 18 tipos
├── app.routes.ts                     # Roteamento lazy-loaded e wildcard
└── app.config.ts                     # ApplicationConfig com Fetch API moderna
```

### Principais Padrões Utilizados:
1. **RemoteData Pattern (`RemoteData<T>`)**: Modelagem explícita dos estados assíncronos (`idle`, `loading`, `success`, `error`), eliminando completamente `undefined`/`null` não tratados na UI.
2. **Arquitetura Smart vs Dumb**: Páginas orquestram o estado e a injeção de dependências; componentes visuais são puramente declarativos e recebem inputs/outputs.
3. **Mappers Funcionais Puros**: Isola os contratos brutos da API externa da lógica visual interna da aplicação.

---

## 🧪 Testes Unitários

O projeto utiliza **Vitest** para execução ultrarrápida de testes de unidade e regras de negócio:

```bash
npm run test:unit
```

> **100% de Aprovação:** 28 testes passando cobrindo modelos, mappers, cálculos de paginação, instanciação do app e persistência de favoritos.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ ou 20+
- npm 9+

### Passos
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/CA10V1ANA/pokedex-hackaton.git
   cd pokedex-hackaton
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```
   Acesse no navegador em: `http://localhost:4200/`

4. **Gerar build de produção:**
   ```bash
   npm run build:prod
   ```

5. **Deploy no GitHub Pages:**
   ```bash
   npm run deploy
   ```

---

## 📄 Licença

Projeto desenvolvido para fins educacionais e de hackathon sob a licença [MIT](LICENSE).
