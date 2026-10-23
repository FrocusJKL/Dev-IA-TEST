# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- v1.2 funcionando: registrar sesiones (fecha, tema, minutos), racha actual y mejor racha
(la mayor corrida histórica hasta hoy), total de minutos de la semana (lunes–domingo) y
lista de sesiones. Datos en localStorage, todo se calcula desde las fechas guardadas.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Mejor racha y minutos de la semana se calculan (no se guardan): un valor guardado
podría quedar desincronizado con los datos reales.
- "Esta semana" empieza en lunes (ISO 8601, convención española), calculado en local.
- Fechas futuras no cuentan en ninguna métrica. No se impiden guardarlas (no se pidió
restringir el formulario).
- AGENTS.md se corrigió para describir el código real (clave `diarioDeEstudio.sesiones`,
campos `{ id, fecha, tema, minutos, creadoEn }`): la documentación manda sobre el código,
pero una doc que no coincide hace que un agente "arregle" el código a lo que dice la doc.
## Aprendizajes y errores a evitar
- Contraste racha actual → mejor racha: mirar hacia atrás desde hoy ≠ mayor corrida del
historial. La actual puede ser 0 y la mejor 3. Probar ambos con huecos de un día.
- Métricas distintas sobre los mismos días: la racha cuenta el día una vez; los minutos
suman todas las sesiones del día. No confundir sesiones con días.
## Próximos pasos
- (vacío por ahora)
