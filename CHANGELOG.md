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

## [1.0.2] — 2026-04-04

### Agregado
- Botón **Recomendada** junto al selector de clave: aplica 174 BPM, clave 3-2, activa Beat + Clave + Conga + Timbal

### Corregido
- Síntesis de clave: reemplazado sweep de pitch descendente (sonaba a bombo) por dos senos fijos (2200 Hz + 3700 Hz armónico) con decay de 55ms — sonido seco de madera

---

## [1.1.0] — 2026-04-04

### Agregado
- **Pantalla home** de selección de género: Salsa, Merengue, Bachata, Cha-cha-chá
- **Merengue** — patrones de Güira, Tambora, Conga, Cencerro. Grid de 16 semicorcheas (1 compás). Tempo: 120–160 BPM
- **Bachata** — patrones de Bongó, Güira, Bajo (síncopa en 2+). Grid de 16 corcheas (2 compases). Tempo: 120–140 BPM
- **Cha-cha-chá** — patrones de Clave (2-3 propia), Güiro, Campana, Timbal, Conga. Grid de 16 corcheas (2 compases). Tempo: 100–130 BPM
- Botón de volver (←) desde el metrónomo al selector de género
- `genres.ts` — sistema unificado de configuración de géneros con `stepDuration` por género

### Cambiado
- El scheduler ahora acepta `stepDuration: 'eighth' | 'sixteenth'` para adaptar el timing según el género
- `PercussionPattern.id` pasó de tipo `PercussionId` a `string` para soportar múltiples géneros
- El selector de clave (2-3 / 3-2) y el botón Recomendada ahora aparecen solo en Salsa

---

## [Unreleased]
<!-- Agregar aquí los cambios del próximo release antes de taggear -->
