# autoserv-ms-auth

Identidad de AutoServ AI. Escucha NATS, persiste en el esquema `identity` y valida `JWT_SERVICE` para los tokens que vendrán después.

Variables: `DATABASE_URL`, `NATS_SERVICE`, `JWT_SERVICE`. La plantilla está en `.env.template`.

El mensaje `auth.health` responde con el número de roles sembrados: Administrador, Asesor de Servicio y Técnico Mecánico.
