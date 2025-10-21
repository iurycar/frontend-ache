# Como Adicionar Imagens PNG no Projeto

## Estrutura de Pastas
```
public/
├── Logo_Ache.png
├── Logo_Liora.png
└── sua-imagem.png (exemplo)
```

## Formas de Adicionar Imagens PNG

### 1. Imagem Simples
```jsx
<img src="/sua-imagem.png" alt="Descrição da imagem" />
```

### 2. Imagem com Estilos
```jsx
<img 
  src="/sua-imagem.png" 
  alt="Descrição da imagem" 
  style={{ height: 50, width: 'auto' }} 
/>
```

### 3. Imagem com Classes CSS
```jsx
<img 
  src="/sua-imagem.png" 
  alt="Descrição da imagem" 
  className="h-12 w-auto" 
/>
```

### 4. Imagem Responsiva
```jsx
<img 
  src="/sua-imagem.png" 
  alt="Descrição da imagem" 
  className="w-full h-auto max-w-md" 
/>
```

### 5. Imagem com Lazy Loading
```jsx
<img 
  src="/sua-imagem.png" 
  alt="Descrição da imagem" 
  loading="lazy"
  className="h-12 w-auto" 
/>
```

## Passos para Adicionar uma Nova Imagem

1. **Coloque sua imagem PNG na pasta `public/`**
2. **Use o caminho `/nome-da-imagem.png` no src**
3. **Adicione um alt descritivo para acessibilidade**
4. **Ajuste o tamanho conforme necessário**

## Exemplo Prático no Login.tsx

```jsx
const LogoSection = () => (
  <div style={{
    position: 'absolute',
    top: 20,
    right: 20,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 10
  }}>
    <img src="/Logo_Ache.png" alt="Logo Aché" style={{ height: 50 }} />
    <img src="/Logo_Liora.png" alt="Logo Liora" style={{ height: 50 }} />
    {/* Sua nova imagem aqui */}
    <img src="/sua-imagem.png" alt="Sua descrição" style={{ height: 50 }} />
  </div>
);
```

## Dicas Importantes

- ✅ Sempre use caminhos que começam com `/` para imagens na pasta public
- ✅ Adicione sempre o atributo `alt` para acessibilidade
- ✅ Use estilos inline ou classes CSS para controlar o tamanho
- ✅ Para imagens grandes, considere usar `loading="lazy"`
- ✅ Mantenha as imagens organizadas na pasta `public/`
