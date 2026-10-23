# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1.1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual y mejor racha
(la mayor corrida histórica hasta hoy), lista de sesiones. Datos en localStorage.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha se calcula (no se guarda) a partir de las fechas: un valor guardado podría
quedarse desincronizado si se registran sesiones de días pasados o se borra algo.
- Fechas futuras no cuentan ni para la racha actual ni para la mejor: coherente con la
regla del proyecto. No se impiden guardarlas (no se pidió restringir el formulario).
- AGENTS.md se corrigió para describir el código real (clave `diarioDeEstudio.sesiones`,
campos `{ id, fecha, tema, minutos, creadoEn }`): la documentación manda sobre el código,
pero una doc que no coincide hace que un agente "arregle" el código a lo que dice la doc.
## Aprendizajes y errores a evitar
- Contraste racha actual → mejor racha: mirar hacia atrás desde hoy ≠ mayor corrida del
historial. La actual puede ser 0 y la mejor 3. Probar ambos con huecos de un día.
## Próximos pasos
- (vacío por ahora)
