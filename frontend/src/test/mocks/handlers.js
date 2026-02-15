import { http, HttpResponse } from 'msw';

// Shared mock data - mutable so tests can modify it
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
  { id: 1, product: products[0], location: locations[0], quantity: 150, updatedAt: '2025-01-01T00:00:00' },
  { id: 2, product: products[0], location: locations[1], quantity: 30, updatedAt: '2025-01-01T00:00:00' },
  { id: 3, product: products[1], location: locations[0], quantity: 75, updatedAt: '2025-01-01T00:00:00' },
  { id: 4, product: products[1], location: locations[1], quantity: 5, updatedAt: '2025-01-01T00:00:00' },
];

let thresholds = [
  { id: 1, product: products[0], location: locations[0], productId: 1, locationId: 1, minQuantity: 20 },
  { id: 2, product: products[1], location: locations[1], productId: 2, locationId: 2, minQuantity: 10 },
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
  nextProductId = 3;
  nextLocationId = 3;
  nextCategoryId = 3;
}

export const handlers = [
  // Categories
  http.get('/api/categories', () => {
    return HttpResponse.json(categories);
  }),

  http.get('/api/categories/:id', ({ params }) => {
    const category = categories.find((c) => c.id === Number(params.id));
    if (!category) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(category);
  }),

  http.post('/api/categories', async ({ request }) => {
    const body = await request.json();
    const category = { id: nextCategoryId++, ...body, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' };
    categories.push(category);
    return HttpResponse.json(category, { status: 201 });
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
  http.get('/api/products', () => {
    return HttpResponse.json(products);
  }),

  http.get('/api/products/:id', ({ params }) => {
    const product = products.find((p) => p.id === Number(params.id));
    if (!product) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(product);
  }),

  http.post('/api/products', async ({ request }) => {
    const body = await request.json();
    const product = { id: nextProductId++, ...body, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' };
    products.push(product);
    return HttpResponse.json(product, { status: 201 });
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
  http.get('/api/locations', () => {
    return HttpResponse.json(locations);
  }),

  http.get('/api/locations/:id', ({ params }) => {
    const location = locations.find((l) => l.id === Number(params.id));
    if (!location) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json(location);
  }),

  http.post('/api/locations', async ({ request }) => {
    const body = await request.json();
    const location = { id: nextLocationId++, ...body, createdAt: '2025-01-01T00:00:00', updatedAt: '2025-01-01T00:00:00' };
    locations.push(location);
    return HttpResponse.json(location, { status: 201 });
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
    return HttpResponse.json(stockLevels);
  }),

  http.get('/api/stock/location/:id', ({ params }) => {
    const filtered = stockLevels.filter((s) => s.location.id === Number(params.id));
    return HttpResponse.json(filtered);
  }),

  http.get('/api/stock/product/:id', ({ params }) => {
    const filtered = stockLevels.filter((s) => s.product.id === Number(params.id));
    return HttpResponse.json(filtered);
  }),

  http.put('/api/stock', async ({ request }) => {
    const body = await request.json();
    const idx = stockLevels.findIndex(
      (s) => s.product.id === body.productId && s.location.id === body.locationId,
    );
    if (idx !== -1) {
      stockLevels[idx] = { ...stockLevels[idx], quantity: body.quantity };
      return HttpResponse.json(stockLevels[idx]);
    }
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),

  // Alerts
  http.get('/api/stock/alerts', () => {
    return HttpResponse.json(alerts);
  }),

  // Thresholds
  http.get('/api/thresholds', () => {
    return HttpResponse.json(thresholds);
  }),

  http.put('/api/thresholds', async ({ request }) => {
    const body = await request.json();
    const threshold = { id: 3, ...body, product: products[0], location: locations[0] };
    thresholds.push(threshold);
    return HttpResponse.json(threshold);
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
