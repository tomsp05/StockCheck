import { http, HttpResponse } from 'msw';

let categories = [
  {
    id: 1, name: 'Toys',
    attributes: [
      { name: 'Age Range', type: 'dropdown', options: ['0-3', '3-6', '6-12', '12+'] },
      { name: 'Material', type: 'text', options: null },
    ],
    createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00',
  },
  {
    id: 2, name: 'Art Supplies',
    attributes: [
      { name: 'Colour Count', type: 'number', options: null },
      { name: 'Medium', type: 'dropdown', options: ['Pencil', 'Paint', 'Marker', 'Crayon'] },
    ],
    createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00',
  },
];

let products = [
  { id: 1, name: 'Widget A', sku: 'WGT-001', description: 'Standard widget', categoryId: 1, attributeValues: { 'Age Range': '3-6', Material: 'Plastic' }, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' },
  { id: 2, name: 'Gadget B', sku: 'GDG-002', description: 'Premium gadget', categoryId: 2, attributeValues: { 'Colour Count': '12', Medium: 'Pencil' }, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' },
];

let locations = [
  { id: 1, name: 'Main Warehouse', address: '1 Industrial Park, London', createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' },
  { id: 2, name: 'High Street Store', address: '42 High Street, London', createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' },
];

let stockLevels = [
  { id: 1, productId: 1, locationId: 1, quantity: 150, updatedAt: '2025-01-01T00:00:00' },
  { id: 2, productId: 1, locationId: 2, quantity: 30, updatedAt: '2025-01-01T00:00:00' },
  { id: 3, productId: 2, locationId: 1, quantity: 75, updatedAt: '2025-01-01T00:00:00' },
  { id: 4, productId: 2, locationId: 2, quantity: 5, updatedAt: '2025-01-01T00:00:00' },
];

let thresholds = [
  { id: 1, product: { id: 1, name: 'Widget A' }, location: { id: 1, name: 'Main Warehouse' }, productId: 1, locationId: 1, minQuantity: 20 },
  { id: 2, product: { id: 2, name: 'Gadget B' }, location: { id: 2, name: 'High Street Store' }, productId: 2, locationId: 2, minQuantity: 10 },
];

let alerts = [
  { productId: 2, productName: 'Gadget B', sku: 'GDG-002', locationId: 2, locationName: 'High Street Store', currentQuantity: 5, threshold: 10 },
];

let nextProductId = 3;
let nextLocationId = 3;
let nextCategoryId = 3;

export function resetMockData() {
  categories = [
    {
      id: 1, name: 'Toys',
      attributes: [
        { name: 'Age Range', type: 'dropdown', options: ['0-3', '3-6', '6-12', '12+'] },
        { name: 'Material', type: 'text', options: null },
      ],
      createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00',
    },
    {
      id: 2, name: 'Art Supplies',
      attributes: [
        { name: 'Colour Count', type: 'number', options: null },
        { name: 'Medium', type: 'dropdown', options: ['Pencil', 'Paint', 'Marker', 'Crayon'] },
      ],
      createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00',
    },
  ];
  products = [
    { id: 1, name: 'Widget A', sku: 'WGT-001', description: 'Standard widget', categoryId: 1, attributeValues: { 'Age Range': '3-6', Material: 'Plastic' }, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' },
    { id: 2, name: 'Gadget B', sku: 'GDG-002', description: 'Premium gadget', categoryId: 2, attributeValues: { 'Colour Count': '12', Medium: 'Pencil' }, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' },
  ];
  locations = [
    { id: 1, name: 'Main Warehouse', address: '1 Industrial Park, London', createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' },
    { id: 2, name: 'High Street Store', address: '42 High Street, London', createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' },
  ];
  stockLevels = [
    { id: 1, productId: 1, locationId: 1, quantity: 150, updatedAt: '2025-01-01T00:00:00' },
    { id: 2, productId: 1, locationId: 2, quantity: 30, updatedAt: '2025-01-01T00:00:00' },
    { id: 3, productId: 2, locationId: 1, quantity: 75, updatedAt: '2025-01-01T00:00:00' },
    { id: 4, productId: 2, locationId: 2, quantity: 5, updatedAt: '2025-01-01T00:00:00' },
  ];
  thresholds = [
    { id: 1, product: { id: 1, name: 'Widget A' }, location: { id: 1, name: 'Main Warehouse' }, productId: 1, locationId: 1, minQuantity: 20 },
    { id: 2, product: { id: 2, name: 'Gadget B' }, location: { id: 2, name: 'High Street Store' }, productId: 2, locationId: 2, minQuantity: 10 },
  ];
  alerts = [
    { productId: 2, productName: 'Gadget B', sku: 'GDG-002', locationId: 2, locationName: 'High Street Store', currentQuantity: 5, threshold: 10 },
  ];
  nextProductId = 3;
  nextLocationId = 3;
  nextCategoryId = 3;
}

export const handlers = [
  // Categories
  http.get('/api/categories', () => HttpResponse.json(categories)),
  http.get('/api/categories/:id', ({ params }) => {
    const cat = categories.find((c) => c.id === Number(params.id));
    return cat ? HttpResponse.json(cat) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  http.post('/api/categories', async ({ request }) => {
    const body = await request.json();
    const cat = { id: nextCategoryId++, ...body, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' };
    categories.push(cat);
    return HttpResponse.json(cat, { status: 201 });
  }),
  http.put('/api/categories/:id', async ({ params, request }) => {
    const body = await request.json();
    const idx = categories.findIndex((c) => c.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    categories[idx] = { ...categories[idx], ...body };
    return HttpResponse.json(categories[idx]);
  }),
  http.delete('/api/categories/:id', ({ params }) => {
    categories = categories.filter((c) => c.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  // Products
  http.get('/api/products', () => HttpResponse.json(products)),
  http.get('/api/products/:id', ({ params }) => {
    const p = products.find((p) => p.id === Number(params.id));
    return p ? HttpResponse.json(p) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  http.post('/api/products', async ({ request }) => {
    const body = await request.json();
    const p = { id: nextProductId++, ...body, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' };
    products.push(p);
    return HttpResponse.json(p, { status: 201 });
  }),
  http.put('/api/products/:id', async ({ params, request }) => {
    const body = await request.json();
    const idx = products.findIndex((p) => p.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    products[idx] = { ...products[idx], ...body };
    return HttpResponse.json(products[idx]);
  }),
  http.delete('/api/products/:id', ({ params }) => {
    products = products.filter((p) => p.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  // Locations
  http.get('/api/locations', () => HttpResponse.json(locations)),
  http.get('/api/locations/:id', ({ params }) => {
    const l = locations.find((l) => l.id === Number(params.id));
    return l ? HttpResponse.json(l) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  http.post('/api/locations', async ({ request }) => {
    const body = await request.json();
    const l = { id: nextLocationId++, ...body, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' };
    locations.push(l);
    return HttpResponse.json(l, { status: 201 });
  }),
  http.put('/api/locations/:id', async ({ params, request }) => {
    const body = await request.json();
    const idx = locations.findIndex((l) => l.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    locations[idx] = { ...locations[idx], ...body };
    return HttpResponse.json(locations[idx]);
  }),
  http.delete('/api/locations/:id', ({ params }) => {
    locations = locations.filter((l) => l.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  // Stock Levels
  http.get('/api/stock', () => {
    const enrichedStockLevels = stockLevels.map(sl => {
      const product = products.find(p => p.id === sl.productId);
      const location = locations.find(l => l.id === sl.locationId);
      return {
        ...sl,
        product,
        location,
      };
    });
    return HttpResponse.json(enrichedStockLevels);
  }),
  http.get('/api/stock/location/:id', ({ params }) => {
    return HttpResponse.json(stockLevels.filter((s) => s.locationId === Number(params.id)));
  }),
  http.get('/api/stock/product/:id', ({ params }) => {
    return HttpResponse.json(stockLevels.filter((s) => s.productId === Number(params.id)));
  }),
  http.put('/api/stock', async ({ request }) => {
    const body = await request.json();
    const idx = stockLevels.findIndex((s) => s.productId === body.productId && s.locationId === body.locationId);
    if (idx !== -1) {
      stockLevels[idx] = { ...stockLevels[idx], quantity: body.quantity };
      const enriched = {
        ...stockLevels[idx],
        product: products.find(p => p.id === stockLevels[idx].productId),
        location: locations.find(l => l.id === stockLevels[idx].locationId),
      }
      return HttpResponse.json(enriched);
    }
    const newStockLevel = {
      id: stockLevels.length + 1,
      ...body,
      updatedAt: '2025-01-01T00:00:00',
    };
    stockLevels.push(newStockLevel);
    const enriched = {
      ...newStockLevel,
      product: products.find(p => p.id === newStockLevel.productId),
      location: locations.find(l => l.id === newStockLevel.locationId),
    }
    return HttpResponse.json(enriched);
  }),

  // Alerts
  http.get('/api/stock/alerts', () => HttpResponse.json(alerts)),

  // Thresholds
  http.get('/api/thresholds', () => HttpResponse.json(thresholds)),
  http.put('/api/thresholds', async ({ request }) => {
    const body = await request.json();
    const t = { id: 3, ...body, product: products[0], location: locations[0] };
    thresholds.push(t);
    return HttpResponse.json(t);
  }),
  http.delete('/api/thresholds/:id', ({ params }) => {
    thresholds = thresholds.filter((t) => t.id !== Number(params.id));
    return new HttpResponse(null, { status: 204 });
  }),

  // Export
  http.get('/api/export/stock.csv', () => {
    return HttpResponse.text('product,location,quantity\nWidget A,Main Warehouse,150');
  }),
];
