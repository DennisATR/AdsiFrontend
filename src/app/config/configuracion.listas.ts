export namespace ConfiguracionListas {

    // Ciudades de Colombia
    export const ciudadesColombia: string[] = [
        'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
        'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
        'Pasto', 'Manizales', 'Neiva', 'Villavicencio', 'Armenia',
        'Valledupar', 'Montería', 'Sincelejo', 'Popayán', 'Tunja',
        'Florencia', 'Riohacha', 'Yopal', 'Quibdó', 'Leticia',
        'San Andrés', 'Mitú', 'Puerto Carreño', 'Inírida', 'Mocoa',
        'Arauca', 'Apartadó', 'Itagüí', 'Soacha', 'Bello',
        'Envigado', 'Palmira', 'Buenaventura', 'Tumaco', 'Ipiales',
        'Tuquerres', 'Maicao', 'Cumbal', 'Sandoná', 'Guachucal', 'Samaniego',
        'El Tambo', 'Pasto', 'Santader', 'Ecuador'
    ];

    // Conceptos de Gasto
    export const conceptosGasto: string[] = [
        'Arriendo', 'Servicio de luz', 'Servicio de agua', 'Pan del día', 'Publicidad', 'Internet',
        'Papel higiénico', 'Artículos de limpieza', 'Retiro de caja', 'Otros'
    ];

    export const categoriasZapatos: string[] = [
        // Por tipo de calzado
        'Deportivo', 'Casual', 'Formal', 'Bota de cuero', 'Bota de caucho',
        'Sandalia', 'Zapatilla', 'Mocasin', 'Alpargata', 'Pantufla',
        'Tacon', 'Plataforma', 'Botin', 'Chancla', 'Sneakers',

        // Por uso o propósito
        'Running', 'Basketball', 'Fútbol', 'Microfútbol sintética', 'Microfútbol cemento',
        'Escolar', 'Trabajo / seguridad', 'Outdoor', 'Importado',

        // Por público o estilo
        'Señorial', 'Económico', 'Elegantes', 'Bebe',

        // Por materiales
        'Cuero', 'Cuero sintético', 'Lona', 'Gamuza', 'Tela', 'Caucho'
    ];

    // Colores de Zapatos
    export const colores: string[] = [
        // Colores básicos
        'Negro', 'Blanco', 'Gris', 'Azul', 'Rojo', 'Verde', 'Amarillo',
        'Café', 'Beige', 'Marrón', 'Turquesa', 'Morado', 'Vinotinto'
        , 'Lila', 'Salmon', 'Violeta', 'Tomate', 'Lima', 'Turquesa', 'Navy', "Nude"
        , "Marron", "Moraleche", "Charol",

        // Tonos y variantes
        'Azul marino', 'Azul cielo', 'Verde oliva', 'Verde militar',
        'Burdeos', 'Rosado', 'Fucsia', 'Naranja', 'Mostaza',
        'Crema', 'Arena', 'Chocolate', 'Caramelo', 'Caqui',

        // Metálicos y especiales
        'Dorado', 'Plateado', 'Cobre', 'Bronce', 'Gris metálico', 'Palo Rosa',

        // Combinados y estilos
        'Bicolor', 'Tricolor', 'Camuflado', 'Animal print', 'Multicolor',

        // Tonos neutros o suaves
        'Blanco hueso', 'Gris claro', 'Gris oscuro', 'Taupe', 'Perla'
    ];

    export const empresasTransporte: string[] = [
        'Servientrega', 'Coordinadora', 'Interrapidisimo',
        'Envia', 'TCC', 'Deprisa'
    ];

    export const generos: string[] = [
        'Hombre', 'Mujer', 'Unisex'
    ];

    export const tipodeVentas: string[] = [
        'Contado', 'Crédito'
    ];

    export const razonesDevolucion: string[] = [
        'Producto defectuoso', 'Talla incorrecta', 'Cambio de producto',
        'Color diferente al pedido', 'Entrega tardía', 'Producto equivocado',
        'Dañado durante el envío'
    ];
}
