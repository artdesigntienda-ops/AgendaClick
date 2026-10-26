export interface LocationHierarchy {
  country: string
  departments: {
    [department: string]: string[]
  }
}

export const COLOMBIA_DEPARTMENTS: Record<string, string[]> = {
  'Antioquia': [
    'Medellín', 'Bello', 'Itagüí', 'Envigado', 'Rionegro', 'Sabaneta', 
    'Caldas', 'Copacabana', 'La Estrella', 'Apartadó', 'Turbo', 'Caucasia', 
    'Marinilla', 'Guarne', 'Girardota', 'Santa Rosa de Osos', 'Yarumal', 
    'El Carmen de Viboral', 'La Ceja', 'Chigorodó', 'Carepa'
  ],
  'Bogotá D.C.': [
    'Bogotá D.C.'
  ],
  'Cundinamarca': [
    'Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Fusagasugá', 'Mosquera', 
    'Madrid', 'Funza', 'Cajicá', 'Girardot', 'Ubaté', 'Tocancipá', 
    'Cota', 'Sopó', 'La Calera', 'Gachancipá', 'Villeta', 'Pacho'
  ],
  'Valle del Cauca': [
    'Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga (Guadalajara de Buga)', 
    'Jamundí', 'Yumbo', 'Candelaria', 'Florida', 'Pradera', 'Zarzal', 'Roldanillo', 'Sevilla'
  ],
  'Atlántico': [
    'Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia', 
    'Baranoa', 'Galapa', 'Santo Tomás', 'Palmar de Varela', 'Sabanagrande'
  ],
  'Santander': [
    'Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 
    'San Gil', 'Socorro', 'Barbosa', 'Vélez', 'Lebrija', 'Zapatoca'
  ],
  'Nariño': [
    'Pasto', 'Ipiales', 'Tumaco', 'Túquerres', 'Samaniego', 'La Unión', 
    'Sandoná', 'Cumbal', 'Guaitarilla', 'Buesaco', 'El Charco', 'Consacá'
  ],
  'Bolívar': [
    'Cartagena', 'Magangué', 'El Carmen de Bolívar', 'Arjona', 'Turbaco', 
    'Mompós', 'San Juan Nepomuceno', 'María la Baja', 'San Jacinto'
  ],
  'Risaralda': [
    'Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 
    'Belén de Umbría', 'Santuario', 'Quinchía'
  ],
  'Caldas': [
    'Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio', 
    'Anserma', 'Salamina', 'Aguadas', 'Supía'
  ],
  'Quindío': [
    'Armenia', 'Calarcá', 'La Tebaida', 'Montenegro', 'Quimbaya', 
    'Circasia', 'Filandia', 'Salento'
  ],
  'Huila': [
    'Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 
    'San Agustín', 'Gigante', 'Palermo', 'Rivera'
  ],
  'Tolima': [
    'Ibagué', 'Espinal', 'Melgar', 'Chaparral', 'Mariquita', 
    'Líbano', 'Honda', 'Flandes', 'Guamo', 'Fresno'
  ],
  'Meta': [
    'Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín', 
    'Cumaral', 'Restrepo', 'Puerto Gaitán'
  ],
  'Boyacá': [
    'Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 
    'Puerto Boyacá', 'Moniquirá', 'Villa de Leyva', 'Garagoa', 'Samacá'
  ],
  'Córdoba': [
    'Montería', 'Cereté', 'Sahagún', 'Lorica', 'Montelíbano', 
    'Tierralta', 'Ciénaga de Oro', 'Planeta Rica', 'San Pelayo'
  ],
  'Magdalena': [
    'Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato', 
    'Aracataca', 'Pivijay', 'Zona Bananera'
  ],
  'Norte de Santander': [
    'Cúcuta', 'Ocaña', 'Villa del Rosario', 'Los Patios', 'Pamplona', 
    'Tibú', 'Ábrego', 'Chinácota', 'El Zulia'
  ],
  'Cauca': [
    'Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía (El Bordo)', 
    'Piendamó', 'Bolívar', 'Corinto', 'Caloto', 'Guapi'
  ],
  'Cesar': [
    'Valledupar', 'Aguachica', 'Agustín Codazzi', 'Bosconia', 
    'Curumaní', 'La Jagua de Ibirico', 'San Alberto', 'El Paso'
  ],
  'Sucre': [
    'Sincelejo', 'Corozal', 'San Marcos', 'San Onofre', 'Tolú', 
    'Sampués', 'Sincé', 'Coveñas', 'Majagual'
  ],
  'Casanare': [
    'Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo', 'Monterrey'
  ],
  'Caquetá': [
    'Florencia', 'San Vicente del Caguán', 'Cartagena del Chairá', 'Puerto Rico', 'Belén de los Andaquíes'
  ],
  'Chocó': [
    'Quibdó', 'Istmina', 'Tadó', 'Condoto', 'Bahía Solano', 'Acandí'
  ],
  'La Guajira': [
    'Riohacha', 'Maicao', 'Uribia', 'Fonseca', 'San Juan del Cesar', 'Manaure', 'Villanueva'
  ],
  'Putumayo': [
    'Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez (La Hormiga)', 'Villagarzón', 'Sibundoy'
  ],
  'Arauca': [
    'Arauca', 'Tame', 'Saravena', 'Arauquita', 'Fortul'
  ],
  'San Andrés y Providencia': [
    'San Andrés', 'Providencia'
  ],
  'Amazonas': [
    'Leticia', 'Puerto Nariño'
  ],
  'Guaviare': [
    'San José del Guaviare', 'El Retorno', 'Calamar'
  ],
  'Guainía': [
    'Inírida'
  ],
  'Vaupés': [
    'Mitú', 'Carurú'
  ],
  'Vichada': [
    'Puerto Carreño', 'La Primavera', 'Cumaribo', 'Santa Rosalía'
  ]
}

export const COUNTRIES = [
  'Colombia',
  'México',
  'Estados Unidos',
  'España',
  'Ecuador',
  'Perú',
  'Chile',
  'Argentina',
  'Otro País'
]
