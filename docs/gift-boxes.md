# Cajas de Regalo — Guia de configuracion

## Como funciona

Cuando un cliente agrega productos al carrito, el sistema de cajas de regalo le permite:
1. Asignar cada producto a una caja (max 6 productos por caja)
2. Elegir el estilo de caja para cada grupo
3. Al hacer checkout, los productos de caja se agregan automaticamente al pedido

Las cajas disponibles se cargan desde la coleccion **"Cajas de Regalo"** (`cajas-de-regalo`) en Shopify.

---

## Agregar una nueva caja

### Paso 1: Crear el producto

1. Ve a **Shopify Admin → Productos → Agregar producto**
2. Llena los campos:
   - **Titulo**: El nombre de la caja (ej: "Caja Kraft", "Caja Premium Rosa")
   - **Imagen**: Sube una foto de la caja. Esta imagen aparece en el selector del carrito (se muestra a 100px, pero sube al menos 400px de ancho)
   - **Precio**: El costo de la caja
   - **Inventario**: Configura el stock si aplica

### Paso 2: Agregar el tag obligatorio

En la seccion de **Tags** del producto, agrega:

```
is-gift-box
```

> **Importante**: Sin este tag, la caja NO aparecera en el selector del carrito aunque este en la coleccion. El sistema filtra especificamente por este tag.

### Paso 3: Agregar a la coleccion

1. Ve a **Shopify Admin → Colecciones**
2. Abre la coleccion **"Cajas de Regalo"**
   - Si no existe, creala con el handle exacto: `cajas-de-regalo`
3. Agrega el producto de caja a esta coleccion

### Paso 4: Verificar

1. Abre la tienda en una **ventana de incognito** (el sistema cachea los datos en sessionStorage)
2. Agrega cualquier producto al carrito
3. Abre el carrito — deberia aparecer la seccion "Elige tu caja" con la nueva opcion

---

## Editar una caja existente

- **Cambiar imagen/precio/titulo**: Edita el producto directamente en Shopify Admin. Los cambios se reflejan automaticamente
- **Despues de editar**: Los clientes con sesion activa veran la version cacheada. Al cerrar y abrir el navegador (o ventana incognito) veran los cambios

---

## Eliminar una caja

1. Quita el producto de la coleccion "Cajas de Regalo", **o**
2. Elimina el tag `is-gift-box` del producto, **o**
3. Elimina el producto

---

## Ocultar temporalmente una caja

Si quieres desactivar una caja sin eliminarla:
- Quita el tag `is-gift-box` → no aparece en el selector
- Vuelve a agregar el tag cuando quieras reactivarla

---

## Requisitos tecnicos

| Requisito | Detalle |
|-----------|---------|
| Coleccion | Handle debe ser exactamente `cajas-de-regalo` |
| Tag | Cada producto de caja debe tener el tag `is-gift-box` |
| Imagen | Obligatoria — se muestra como miniatura en el selector |
| Max productos por caja | 6 (configurado en `gift-box-manager.js`) |
| Cache | sessionStorage del navegador. Se limpia al cerrar ventana |

## Archivos relacionados

| Archivo | Funcion |
|---------|---------|
| `snippets/cart-drawer.liquid` | Carga los productos de caja como JSON (lineas 6-23) |
| `assets/gift-box-manager.js` | Logica completa del sistema de cajas |
| `snippets/cart-box-selector.liquid` | UI del selector de cajas en el carrito |
| `snippets/cart-item-box-dropdown.liquid` | Dropdown de asignacion por producto |

---

## Troubleshooting

**Las cajas no aparecen en el carrito:**
1. Verifica que el producto tenga el tag `is-gift-box`
2. Verifica que este en la coleccion `cajas-de-regalo`
3. Prueba en ventana de incognito (para evitar cache)
4. Revisa la consola del navegador por errores de `GiftBoxManager`

**Se ven datos viejos despues de cambiar cajas:**
- El sistema cachea en `sessionStorage`. El cliente debe cerrar la pestaña/ventana para limpiar el cache
