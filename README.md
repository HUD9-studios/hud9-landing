# HUD9 Studios

Sitio oficial de HUD9 Studios, un estudio de desarrollo de videojuegos y tecnología inmersiva. La Fase 1A establece la base técnica y presenta una página mínima en inglés y español.

## Entorno y ejecución

Usa Node.js 24 LTS (24.15.0 o posterior dentro de la rama 24), npm 11 y Git. Usa el último parche de seguridad disponible. Instala las versiones fijadas en `package-lock.json` con `npm ci`.

```bash
npm ci
npm run dev
```

Abre `http://localhost:3000`. Para probar el servidor de producción en local, ejecuta `npm run build` y luego `npm start`.

## Decisiones temporales de la Fase 1A

- **Webpack.** Los scripts de desarrollo y compilación lo usan temporalmente porque el worker de Node de Turbopack terminó antes de conectarse al compilador al procesar un SCSS Module en Windows. Volver a Turbopack cuando un build limpio en Windows y las pruebas HTTP de las rutas localizadas y sus assets pasen.
- **Seguridad.** El aviso moderado de `minimatch` queda resuelto con un override temporal limitado a `@typescript-eslint/typescript-estree@8.72.2`. npm resuelve `minimatch@11.0.8` para ese paquete y `npm audit` reporta cero vulnerabilidades, incluidas las dependencias de desarrollo. La validación comprobó la API CommonJS que usa el parser y los casos de admisión y rechazo de `projectService.allowDefaultProject`. Retira el override cuando una versión estable y compatible de `typescript-eslint` incorpore una versión corregida de `minimatch` y vuelva a pasar estas comprobaciones. [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)

## Estructura

| Ruta                    | Responsabilidad                                        |
| ----------------------- | ------------------------------------------------------ |
| `src/app/[locale]/`     | Layout raíz, páginas y metadatos de App Router.        |
| `src/proxy.ts`          | Resolución del idioma al entrar por `/`.               |
| `src/components/`       | Componentes reutilizables y sus SCSS Modules.          |
| `src/features/landing/` | Composición y comportamiento propios de la landing.    |
| `src/i18n/`             | Idiomas admitidos, negociación y diccionarios tipados. |
| `src/styles/`           | Estilos globales y tokens semánticos.                  |
| `public/`               | Recursos estáticos servidos desde la raíz.             |
| `scripts/`              | Utilidades de verificación.                            |

Mantén el enrutamiento y la obtención de datos en `src/app`, y pasa a los componentes los datos traducidos que necesitan. Usa PascalCase para componentes y sus archivos, camelCase para funciones y variables, y kebab-case para archivos de utilidades y carpetas funcionales. Prefiere Server Components y limita el código de cliente a la interacción que lo requiera.

Usa SCSS Modules para estilos de componentes y los tokens globales para medidas, color y tipografía compartidos. Las medidas de espaciado se adaptan con `clamp()`. En las transiciones decorativas, usa `--motion-duration`, que se reduce a cero con `prefers-reduced-motion`.

## Internacionalización

`/en` y `/es` se prerenderizan. La URL selecciona el idioma y determina el atributo `lang`, el contenido y los metadatos. Para elegir un idioma explícitamente, enlaza a su ruta.

Al entrar por `/`, el proxy lee `Accept-Language`, considera los idiomas admitidos con calidad positiva y resuelve variantes regionales como `es-CO` a su idioma base. Respeta el orden de la cabecera en caso de empate. Si no hay una preferencia compatible, redirige a `/en`. La redirección conserva la consulta y depende de la cabecera de cada solicitud.

Añade los textos visibles y los metadatos a los diccionarios `en.ts` y `es.ts` con el mismo contrato `Dictionary`. Cada página traduce su título y descripción mediante `generateMetadata`.

## Comandos de calidad

| Comando                  | Función                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `npm run lint`           | Ejecuta ESLint con las reglas de Next.js, React y TypeScript. Falla también ante advertencias. |
| `npm run lint:fix`       | Aplica las correcciones automáticas de ESLint.                                                 |
| `npm run format`         | Aplica Prettier.                                                                               |
| `npm run format:check`   | Comprueba el formato sin escribir archivos.                                                    |
| `npm run typecheck`      | Genera los tipos de rutas y comprueba TypeScript en modo estricto.                             |
| `npm run encoding:check` | Valida la codificación y los finales de línea sin escribir archivos.                           |

## Validación local antes del PR

`npm ci` ejecuta `prepare` e instala el hook de Husky. En cada commit, lint-staged verifica primero la codificación del índice de Git. Después Prettier formatea los archivos staged compatibles respetando `.prettierignore`, y ESLint revisa los archivos JavaScript y TypeScript staged con `--max-warnings=0`. La primera comprobación que falla bloquea el commit. lint-staged incorpora el formato al índice y conserva los cambios unstaged.

El pre-commit valida UTF-8 sin BOM, LF, salto final y ausencia de espacios al final de línea. Usa los atributos de Git del índice para excluir binarios y solo revisa el destino de un renombre. Git puede normalizar los finales de línea al ejecutar `git add`. `npm run encoding:check` revisa el árbol de trabajo completo y `npm run encoding:check -- "ruta con espacios.ts"` valida esa ruta en el índice si está staged.

Ejecuta `npm run quality` antes de solicitar un PR. Se detiene al primer error de lint, formato, tipos, codificación, pruebas con cobertura, auditoría o build. GitHub Actions ejecuta las comprobaciones del checkout completo y mantiene los controles remotos de seguridad y Sonar. En Actions, `HUSKY=0` evita que `npm ci` instale hooks locales.

## Pruebas y cobertura

- `npm test` abre Vitest en modo interactivo. `npm run test:run` ejecuta la suite una vez.
- `npm run test:coverage` ejecuta la suite con V8 y genera `coverage/lcov.info`. La cobertura incluye todo el TypeScript de producción en `src/`, salvo declaraciones de tipos. Los artefactos de Next.js, las pruebas y las configuraciones quedan fuera de este alcance.
- Los umbrales iniciales de líneas, sentencias, funciones y ramas son **70 % global** y **90 % en `src/i18n/`**. Esto protege la lógica de idioma y permite ampliar la interfaz sin exigir cobertura de cada línea.

## CI, seguridad y SonarQube Cloud

[Quality and security](.github/workflows/quality.yml) se ejecuta en PR hacia `main` y en pushes a cualquier rama, incluida `main`. Los pushes de etiquetas quedan fuera del trigger. Los pushes a `main` permiten inicializar y mantener la línea base de Sonar. El job Quality usa Node.js 24, caché de npm, una instalación y un build. En orden ejecuta lint, formato, tipos, codificación, pruebas con cobertura y `npm audit --include=dev` antes del build. Cada comprobación detiene el job si falla.

Dependency Review bloquea vulnerabilidades nuevas en PR, incluidas las dependencias de desarrollo. CodeQL analiza JavaScript y TypeScript sin recompilar y publica resultados en GitHub. Un job de CodeQL verde confirma la ejecución y publicación del análisis. La regla **Require code scanning results** determina si los hallazgos bloquean el merge. Las acciones se fijan por SHA y solo CodeQL recibe permiso de escritura de eventos de seguridad.

Sonar analiza TypeScript, JavaScript y estilos. El job `Quality` genera `coverage/lcov.info` en Ubuntu desde la raíz del checkout y verifica que el reporte tenga contenido. El escáner lee esa misma ruta relativa en el mismo job. Sonar es obligatorio en PR hacia `main` y pushes a `main`. Si falta `SONAR_TOKEN` o falla el Quality Gate, falla `Quality`. [Proyecto en SonarQube Cloud](https://sonarcloud.io/project/overview?id=HUD9-studios_hud9-landing)

`Quality` bloquea los PR de forks o de Dependabot antes del checkout y del acceso al secreto. Dependency Review y CodeQL son jobs independientes de Sonar. Para integrar esos cambios, un mantenedor debe revisarlos y abrir un PR desde una rama de confianza. Mantener cobertura y escaneo en el mismo job evita transferir artefactos entre contextos con distintos permisos.

Antes de integrar a `main`:

1. Confirma que la política de Actions permite los SHA del workflow, que el Dependency Graph está habilitado y que CodeQL está en modo avanzado si ya se usaba la configuración predeterminada.
2. En SonarQube Cloud, confirma la vinculación con GitHub y el soporte de PR. Usa análisis desde CI y desactiva el análisis automático si estaba activo. Confirma que `SONAR_TOKEN` existe en GitHub y tiene permiso de análisis. El primer análisis debe ser de `main`. Si aún falta, completa el alta inicial del proyecto con un análisis autorizado del checkout real de `main` antes del primer PR. Si `main` todavía carece de `src/`, usa el alcance de fuentes que exista en ese checkout para la inicialización.
3. Tras la primera ejecución autorizada, activa el ruleset para `main`. En **Require status checks to pass**, exige `Quality`, `Dependency Review` y `CodeQL (JavaScript/TypeScript)`. En **Require code scanning results**, añade **CodeQL** y configura **Security alerts → All** para bloquear cualquier alerta de seguridad nueva. El umbral **Alerts** controla los demás hallazgos por separado. [Protección de merges con code scanning](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/manage-your-configuration/set-merge-protection)

Para revisar el override de `minimatch`, consulta las versiones estables de `typescript-eslint` y `@typescript-eslint/typescript-estree`. Cuando el parser estable declare una versión corregida, actualiza el paquete compatible, retira el override y regenera el lockfile. Comprueba la resolución con `npm ls minimatch` y ejecuta `npm ci`, auditoría, lint, pruebas y build antes de conservar el cambio.

## Codificación

Guarda los archivos de texto en UTF-8 sin BOM, con finales de línea LF, una nueva línea final y sin espacios al final de línea. Usa dos espacios de indentación también en Markdown, JSON, YAML, SCSS y archivos de configuración.

`.editorconfig`, `.gitattributes` y Prettier aplican estas convenciones. El verificador revisa los archivos presentes en el árbol de trabajo que Git rastrea o que todavía no están rastreados y no están ignorados. Los binarios se declaran con el atributo `binary` en `.gitattributes`. El lockfile lo formatea npm y pasa por el verificador de codificación.
