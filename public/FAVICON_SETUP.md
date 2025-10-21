# Configuração do Favicon - Logo Liora

## ✅ O que foi configurado

### 1. **Favicon Principal**
- Logo da Liora (`Logo_Liora.png`) configurado como favicon
- Aparece na aba do navegador ao lado do título
- Substitui o ícone padrão do Vite

### 2. **Arquivos Modificados**
- `index.html` - Arquivo principal do projeto
- `dist/index.html` - Arquivo de build
- `public/site.webmanifest` - Manifesto da aplicação

### 3. **Configurações Adicionadas**

```html
<!-- Favicon - Logo Liora -->
<link rel="icon" type="image/png" href="/Logo_Liora.png" />
<link rel="shortcut icon" type="image/png" href="/Logo_Liora.png" />
<link rel="apple-touch-icon" href="/Logo_Liora.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#ffffff" />
```

### 4. **Manifesto da Aplicação**
Criado `public/site.webmanifest` com:
- Nome da aplicação
- Ícones em diferentes tamanhos
- Tema e cores de fundo
- Suporte para PWA (Progressive Web App)

## 🎯 **Como Funciona**

1. **Navegadores Desktop**: Mostra o logo da Liora na aba
2. **Navegadores Mobile**: Usa o logo como ícone de toque
3. **PWA**: Suporte completo para instalação como app
4. **Compatibilidade**: Funciona em todos os navegadores modernos

## 🔧 **Para Testar**

1. Execute `npm run dev`
2. Abra o navegador em `http://localhost:5173`
3. Verifique se o logo da Liora aparece na aba
4. Teste em diferentes navegadores (Chrome, Firefox, Safari, Edge)

## 📱 **Suporte Mobile**

- **iOS**: Logo aparece quando adicionado à tela inicial
- **Android**: Logo aparece no launcher e notificações
- **PWA**: Aplicação pode ser instalada como app nativo

## 🎨 **Personalização**

Para alterar o favicon:
1. Substitua `Logo_Liora.png` por sua imagem
2. Mantenha o nome do arquivo ou atualize os caminhos
3. Recomendado: imagem quadrada (32x32, 64x64, 128x128px)

## ✅ **Status**

- ✅ Favicon configurado
- ✅ Manifesto criado
- ✅ Compatibilidade mobile
- ✅ Suporte PWA
- ✅ Pronto para produção
