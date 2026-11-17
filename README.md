# AdsiFrontend - Sistema de Gestión Comercial y Punto de Venta (POS)

Frontend web para la administración comercial, control de inventario y punto de venta (POS), optimizado para almacenes y comercios de calzado y artículos relacionados.

---

## Problema que Resuelve

En el comercio minorista de calzado y retail, la administración tradicional suele sufrir de:
- **Descontrol en inventario**: Dificultad para rastrear existencias por atributos específicos (referencia, talla, color, categoría y costo).
- **Descuadres en caja y cartera**: Falta de conciliación confiable entre ventas de contado, ventas a crédito, abonos de clientes, gastos diarios y efectivo real en caja.
- **Falta de visibilidad del negocio**: Procesos manuales en papel o planillas aisladas que impiden conocer en tiempo real los márgenes, los productos más vendidos y el rendimiento del personal de ventas.

**AdsiFrontend** resuelve estas problemáticas centralizando en una plataforma web intuitiva la facturación ágil en punto de venta, la administración de créditos/cartera, el arqueo diario de caja, la trazabilidad de devoluciones y despachos, y la toma de decisiones basada en indicadores financieros y analítica en tiempo real.

---

## Funcionalidades Principales

### 1. Punto de Venta (POS) y Facturación
- Generación rápida de facturas para ventas de **contado** y a **crédito**.
- Soporte para ventas en mostrador y ventas virtuales (con código de seguimiento virtual).
- Línea de venta dinámica con búsqueda de productos y selección de métodos de pago (efectivo, transferencias, etc.).
- Generación, previsualización e impresión de comprobantes de pago y tirillas térmicas (formato PDF).

### 2. Gestión de Créditos y Cartera
- Registro y consulta de ventas otorgadas a crédito.
- Control de abonos, saldos pendientes y detalle de cuentas por cobrar a clientes.

### 3. Devoluciones y Cambios
- Registro de devoluciones asociadas a facturas de venta.
- Gestión de cambios de producto garantizando consistencia en el inventario.

### 4. Control y Cierre de Caja (Arqueo)
- Registro de base inicial de apertura.
- Balance automático: ingresos totales, desglose por método de pago, deducción de gastos y monto esperado en caja.
- Conciliación de efectivo físico (monto real vs. esperado) y detección automática de diferencias o descuadres.

### 5. Inventario y Catálogo Especializado
- Catálogo de calzado parametrizado por referencia, descripción, categoría, talla, color, género, proveedor, precio costo y precios de venta (mínimo/máximo).
- Control de existencias por almacén y series.

### 6. Parámetros y Operaciones del Negocio
- **Clientes y Proveedores**: Directorio completo y administración de terceros.
- **Vendedores**: Registro y seguimiento del personal de ventas.
- **Gastos Operativos**: Registro de salidas de dinero menores del día a día.
- **Logística y Entregas**: Trazabilidad de envíos con número de guía, transportadora, número de cajas y costos de flete.
- **Configuración del Local**: Parámetros fiscales de la empresa (NIT, prefijo de facturación, dirección, IVA).

### 7. Dashboard Analítico y Reportes
- Cuadro de mando interactivo con KPIs de ventas totales, egresos y créditos.
- Gráficos de tendencias temporales, participación por método de pago y ranking de productos más vendidos.

### 8. Seguridad y Control de Acceso
- Autenticación con almacenamiento seguro y cifrado en cliente.
- Protección de rutas con guardianes (`Guards`) e interceptores HTTP para peticiones al backend.
- Administración de usuarios y recuperación de contraseñas.

---

## Tecnologías Usadas

- **Framework Principal**: [Angular 18](https://angular.dev/) (Single Page Application).
- **Lenguaje**: [TypeScript 5.5](https://www.typescriptlang.org/).
- **Programación Reactiva**: [RxJS 7.8](https://rxjs.dev/).
- **Diseño y Componentes UI**: 
  - [Materialize CSS](https://materializecss.com/) (diseño responsivo basado en Material Design).
  - [Material Icons](https://fonts.google.com/icons).
  - [SweetAlert2](https://sweetalert2.github.io/) (modales y alertas interactivas).
- **Visualización de Datos**: [Chart.js 4.5](https://www.chartjs.org/) (gráficos de líneas, barras y donas en el Dashboard).
- **Generación de Documentos**: [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (exportación e impresión de tirillas de venta).
- **Seguridad**: [Crypto-JS](https://cryptojs.altervista.org/) (hashing y cifrado).
- **Paginación y Listados**: `ngx-pagination`.
- **Testing**: [Jasmine](https://jasmine.github.io/) y [Karma](https://karma-runner.github.io/).
- **Integración con Backend**: Conexión a microservicio REST mediante `HttpClient`.

---

## Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 18 o 20 LTS recomendada)
- [npm](https://www.npmjs.com/)
- [Angular CLI](https://github.com/angular/angular-cli) instalado globalmente (`npm install -g @angular/cli`)

### Instalación
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd AdsiFrontend

# Instalar dependencias
npm install
```

### Servidor de Desarrollo
```bash
ng serve
```
Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente al modificar los archivos fuente.

### Compilación para Producción
```bash
ng build
```
Los artefactos de producción se generarán en el directorio `dist/`.

### Ejecutar Pruebas
```bash
ng test
```
