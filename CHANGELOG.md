# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/).
Versiones siguiendo [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`
- **MAJOR** — cambio que rompe compatibilidad o rediseño completo
- **MINOR** — feature nueva sin romper nada existente
- **PATCH** — bugfix o mejora menor

---

## [1.0.1] — 2026-04-03

### Agregado
- Checkbox circular a la izquierda de cada instrumento para activar/desactivar (rojo = activo, borde gris = inactivo)

### Cambiado
- El row del instrumento ya **no** hace toggle al tocar — solo el checkbox activa/desactiva, eliminando el conflicto con el scroll

### Corregido
- Scroll accidental activaba/desactivaba instrumentos al pasar el dedo por la pantalla
- Long press ahora funciona en toda la fila del instrumento, no solo en el potenciómetro
- Selección de texto e iOS callout ya no aparecen durante el long press

---

## [1.0.0] — 2026-04-03

### MVP Salsa — versión inicial

#### Agregado
- 6 percusiones sintéticas (Web Audio API): Clave, Conga, Bongó, Timbal, Güiro, Campana
- Beat (tierra) activable con acento en el tiempo 1
- Control de BPM: slider + botones ±1 / ±5 (rango 40–220)
- Selector de clave Son 3-2 / 2-3
- Grilla de 16 pasos por instrumento con visualizador del paso actual
- Divisores visuales cada 4 pasos
- Indicador de tiempos (pulso de 4 puntos)
- Potenciómetro de volumen por instrumento (knob SVG)
  - Desktop: drag vertical
  - Mobile: long press + drag horizontal (izquierda baja, derecha sube)
- Play button flotante siempre visible
- PWA: instalable en home screen (vite-plugin-pwa + Workbox)

#### Corregido (durante MVP)
- Patrones de clave verificados y corregidos según scphillips.com (3-2: pasos 0,3,6,10,12 / 2-3: pasos 2,4,8,11,14)
- Patrones de conga, timbal, güiro y campana verificados contra la misma referencia
- Beat corregido a 1 clic por tiempo (cada 4 pasos), no cada 2
- AudioContext en iOS/Safari: `resume()` explícito dentro del gesto del usuario para evitar silencio en mobile

---

## [Unreleased]
<!-- Agregar aquí los cambios del próximo release antes de taggear -->
