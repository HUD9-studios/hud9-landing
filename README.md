# HUD9 Studios

Sitio oficial de HUD9 Studios, un estudio de desarrollo de videojuegos y tecnología inmersiva. La Fase 1A establece la base técnica y presenta una página mínima en inglés y español.

## Entorno y ejecución

Usa Node.js 24 LTS con el parche más reciente de esa línea, npm 11 y Git. Instala las versiones fijadas en `package-lock.json` con `npm ci`.

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

## Codificación

Guarda los archivos de texto en UTF-8 sin BOM, con finales de línea LF, una nueva línea final y sin espacios al final de línea. Usa dos espacios de indentación también en Markdown, JSON, YAML, SCSS y archivos de configuración.

`.editorconfig`, `.gitattributes` y Prettier aplican estas convenciones. El verificador revisa los archivos presentes en el árbol de trabajo que Git rastrea o que todavía no están rastreados y no están ignorados. Los binarios se declaran con el atributo `binary` en `.gitattributes`. El lockfile lo formatea npm y pasa por el verificador de codificación.
