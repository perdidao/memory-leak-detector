# Memory Leak Detector - Chrome Extension

Uma extensão do Chrome para detectar e monitorar vazamentos de memória em páginas web em tempo real.

## 🚀 Funcionalidades

Esta extensão monitora e rastreia:

- **Event Listeners**: Acompanha todos os listeners de eventos adicionados e removidos
- **Intervals**: Monitora `setInterval` e `clearInterval`
- **Timeouts**: Monitora `setTimeout` e `clearTimeout`
- **Observers**: Rastreia `ResizeObserver`, `MutationObserver` e `IntersectionObserver`
- **Heap Memory**: Exibe o uso de memória heap do JavaScript
- **Análise de Eventos**: Mostra breakdown dos tipos de eventos mais utilizados

## 📦 Instalação

### Desenvolvimento

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Build da extensão:
   ```bash
   npm run build
   ```

4. Carregue a extensão no Chrome:
   - Abra `chrome://extensions/`
   - Ative o "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `dist`

## 🎯 Como Usar

1. Clique no ícone da extensão na barra de ferramentas do Chrome
2. Clique em "Start Audit" para iniciar o monitoramento
3. A extensão irá coletar estatísticas a cada 5 segundos
4. Visualize em tempo real:
   - Número de event listeners ativos
   - Número de intervals ativos
   - Número de observers ativos
   - Uso de memória heap
   - Percentual de memória heap usado
   - Breakdown dos tipos de eventos (quando houver mais de 20 ocorrências do mesmo tipo)

5. Clique em "Stop Audit" para parar o monitoramento

## 📊 Entendendo os Dados

### Indicadores de Vazamento

- **Números em vermelho (+X)**: Indicam crescimento contínuo, possível vazamento
- **Listeners em excesso**: Se um tipo específico de evento aparece muitas vezes, pode indicar listeners não removidos
- **Memória crescente**: Se a memória heap continua crescendo sem parar, há um vazamento

### Boas Práticas

- Sempre remova event listeners quando não forem mais necessários
- Limpe intervals e timeouts quando o componente for desmontado
- Desconecte observers quando não forem mais usados
- Use `AbortController` para gerenciar event listeners mais facilmente

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
# Modo desenvolvimento com hot reload
npm run dev

# Build de produção
npm run build

# Lint do código
npm run lint
```

### Estrutura do Projeto

```
src/
├── App.tsx                    # Componente principal da UI
├── App.css                    # Estilos da interface
├── services/
│   └── detectMemoryLeaks.ts  # Lógica de detecção de vazamentos
└── main.tsx                   # Entry point
```

## 📝 Créditos

Baseado no gist original de auditoria de vazamentos de memória:
https://gist.github.com/perdidao/9254749e0a6e6251c605f0ea92535105

**Author:** Lucas "perdidão" Almeida

## 📄 Licença

MIT

## 🔧 Como Funciona

A extensão funciona em 3 camadas:

1. **Injected Script**: Código injetado diretamente no contexto da página web que intercepta as APIs do navegador
2. **Content Script**: Ponte entre o script injetado e o popup da extensão
3. **Popup (App.tsx)**: Interface que exibe os dados coletados

### Fluxo de Dados

```
Página Web → Injected Script → Content Script → Popup
     ↑            (coleta)         (ponte)      (exibe)
     |
 Interceptação de APIs
```

## ⚠️ Importante

- Após instalar ou atualizar a extensão, **recarregue a página** que deseja monitorar
- A extensão só monitora a aba ativa atual
- Se a mensagem "Please refresh the page" aparecer, recarregue a página

## 🧪 Testando

Para testar se a extensão está funcionando:

1. Abra uma página web qualquer
2. Abra o console da página (F12)
3. Execute alguns comandos para criar event listeners:
   ```javascript
   // Adicionar alguns listeners
   document.addEventListener('click', () => console.log('click'))
   window.addEventListener('scroll', () => console.log('scroll'))
   
   // Criar um interval
   setInterval(() => console.log('interval'), 1000)
   
   // Criar um observer
   const observer = new MutationObserver(() => {})
   observer.observe(document.body, { childList: true })
   ```

4. Abra a extensão e clique em "Start Audit"
5. Aguarde alguns segundos e veja os números subirem!
