const orders = [];
let nextId = 1;

export const getAllOrders = () => {
  return orders;
};

export const getOrderById = (id) => {
  return orders.find((order) => order.id === id);
};

export const createOrder = (orderData) => {
  const order = { id: nextId++, ...orderData, createdAt: new Date().toISOString() };
  orders.push(order);
  return order;
};

export const updateOrder = (id, orderData) => {
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return null;
  orders[index] = { ...orders[index], ...orderData };
  return orders[index];
};

export const deleteOrder = (id) => {
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return false;
  orders.splice(index, 1);
  return true;
};
