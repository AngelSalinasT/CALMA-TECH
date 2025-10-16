# Especificaciones de Diseño - CALMA TECH

## Paleta de Colores

### Colores Principales
```css
--primary-blue: #5271B4;      /* Botones, navbar, elementos principales */
--primary-blue-dark: #3D5389; /* Hover states */
--light-blue: #A8D5E2;        /* Mensajes de usuario, fondos suaves */
--mint-green: #8BC5BC;        /* Acentos, estados positivos */
--light-gray: #E5E5E5;        /* Inputs, mensajes del bot */
--beige: #E8D5D3;             /* Acentos secundarios */
--white: #FFFFFF;             /* Fondos de cards */
--dark-text: #2C2C2C;         /* Texto principal */
--gray-text: #6B6B6B;         /* Texto secundario */
```

## Tipografía

- **Fuente principal**: Sistema (San Francisco en iOS, Roboto en Android, Inter/System UI en web)
- **Títulos**: 24-28px, Bold
- **Subtítulos**: 18-20px, Semibold
- **Texto normal**: 14-16px, Regular
- **Botones**: 16px, Semibold

## Componentes UI

### Botones
- **Primario**: Fondo azul (#5271B4), texto blanco, padding 14px 24px, border-radius 8px
- **Secundario**: Borde azul, texto azul, fondo transparente
- **Hover**: Oscurecer 10%

### Inputs
- **Estilo**: Fondo gris claro (#E5E5E5), border-radius 24px, padding 12px 20px
- **Focus**: Borde azul 2px
- **Placeholder**: Color gris (#6B6B6B)

### Cards
- **Fondo**: Blanco
- **Sombra**: 0 2px 8px rgba(0,0,0,0.08)
- **Border-radius**: 12px
- **Padding**: 16-24px

### Navigation Bar (Bottom)
- **Altura**: 60px
- **Fondo**: Azul (#5271B4)
- **Iconos**: 4 opciones (Home, Gráficas, Estadísticas, Historial)
- **Iconos activos**: Blanco con mayor opacidad
- **Iconos inactivos**: Blanco con 60% opacidad

## Pantallas Principales

### 1. Login/Register
- Logo centrado en la parte superior
- Formulario con inputs redondeados
- Botón primario full-width
- Links secundarios (Olvidé contraseña, Crear cuenta)
- Checkbox para términos y condiciones

### 2. Chatbot AI
- Header con logo y botón back
- Área de mensajes con scroll
- Mensajes del usuario: azul claro, alineados a la izquierda
- Mensajes del bot: gris, alineados a la derecha
- Input bar fija en la parte inferior
- Botones de voz y envío

### 3. Dashboard (Profesores/Alumnos)
- Header con nombre de usuario
- Cards con información resumida
- Gráficas y estadísticas
- Bottom navigation

### 4. Loading Screen
- Logo centrado
- Animación de puntos de carga
- Fondo blanco

## Diseño Responsive

### Mobile (< 768px)
- Layout de una columna
- Bottom navigation visible
- Cards stack verticalmente
- Inputs full-width

### Tablet (768px - 1024px)
- Layout de 2 columnas
- Sidebar opcional
- Cards en grid 2x2

### Desktop (> 1024px)
- Sidebar permanente
- Layout de 3 columnas
- Cards en grid flexible
- Top navigation en lugar de bottom

## Espaciado

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

## Animaciones

- **Transiciones**: 200-300ms ease-in-out
- **Loading**: Pulse animation en puntos
- **Hover**: Scale 1.02, 150ms
- **Modal**: Fade in 250ms

## Accesibilidad

- Contraste mínimo WCAG AA (4.5:1 para texto normal)
- Tamaños de touch targets: mínimo 44x44px
- Focus visible en todos los elementos interactivos
- Labels en todos los inputs
