# Lista de Espera - MidatoPay

## Descripción
Sistema de lista de espera para capturar el interés de empresas antes del lanzamiento oficial de MidatoPay.

## Base de Datos

### Tabla `waitlist`
```sql
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  monthly_billing_usd INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Políticas de Seguridad
- **SELECT**: Cualquiera puede ver estadísticas de la lista
- **INSERT**: Cualquiera puede unirse a la lista
- **UPDATE/DELETE**: Solo administradores (implementar según necesidad)

## API Endpoints

### POST `/api/waitlist`
Unirse a la lista de espera.

**Request Body:**
```json
{
  "email": "empresa@ejemplo.com",
  "monthly_billing_usd": 10000
}
```

**Response (201):**
```json
{
  "message": "Te has unido exitosamente a la lista de espera",
  "data": {
    "id": "cmflwfp7o0004n3yepo6k0emu",
    "email": "empresa@ejemplo.com",
    "monthly_billing_usd": 10000,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (409) - Email duplicado:**
```json
{
  "error": "Email ya registrado",
  "message": "Este email ya está en nuestra lista de espera"
}
```

### GET `/api/waitlist/stats`
Obtener estadísticas de la lista de espera.

**Response:**
```json
{
  "total_entries": 150,
  "total_billing_usd": 2500000,
  "billing_distribution": [
    {
      "monthly_billing_usd": 1000,
      "_count": { "monthly_billing_usd": 25 }
    }
  ],
  "recent_entries": [
    {
      "id": "cmflwfp7o0004n3yepo6k0emu",
      "email": "empresa@ejemplo.com",
      "monthly_billing_usd": 10000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET `/api/waitlist`
Obtener todas las entradas (admin).

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 50)

## Validaciones

### Email
- Formato válido de email
- Normalización automática
- Único en la base de datos

### Facturación Mensual
- Entero positivo
- Mínimo $1,000 USD
- Rangos predefinidos:
  - $1,000 - $5,000
  - $5,000 - $10,000
  - $10,000 - $25,000
  - $25,000 - $50,000
  - $50,000 - $100,000
  - $100,000+

## Frontend

### Página `/anotate`
- Formulario de registro
- Validación en tiempo real
- Estados de carga y éxito
- Estadísticas visuales
- Diseño responsive

### Características
- **Tipografía**: Gromm para títulos, Montserrat para texto
- **Colores**: Tema naranja/crema de MidatoPay
- **Animaciones**: Framer Motion para transiciones
- **Background**: PixelBlast effect
- **Navegación**: PillNav integrado

## Seguridad

### Rate Limiting
- 100 requests por 15 minutos por IP
- Aplicado a todas las rutas `/api/`

### Validación
- Sanitización de inputs
- Validación de tipos de datos
- Prevención de inyección SQL (Prisma)

### CORS
- Configurado para localhost en desarrollo
- Configurado para dominio de producción

## Monitoreo

### Logs
- Registro de nuevas entradas
- Errores de validación
- Errores de base de datos

### Métricas
- Total de entradas
- Facturación total estimada
- Distribución por rangos
- Entradas recientes

## Próximos Pasos

1. **Email Marketing**: Integrar con servicio de emails
2. **Notificaciones**: Sistema de notificaciones push
3. **Analytics**: Dashboard de métricas avanzadas
4. **Segmentación**: Agrupar por industria/ubicación
5. **Beta Access**: Sistema de acceso temprano
