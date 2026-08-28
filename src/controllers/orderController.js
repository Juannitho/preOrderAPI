import * as orderService from "../services/orderService.js";

export const getOrders = (req, res) => {
  const orders = orderService.getAllOrders();
  res.json({ success: true, data: orders });
};

export const getOrder = (req, res, next) => {
  const order = orderService.getOrderById(Number(req.params.id));
  if (!order) {
    return next({ statusCode: 404, message: "Order not found" });
  }
  res.json({ success: true, data: order });
};

export const createOrder = (req, res) => {
  const order = orderService.createOrder(req.body);
  res.status(201).json({ success: true, data: order });
};

export const updateOrder = (req, res, next) => {
  const order = orderService.updateOrder(Number(req.params.id), req.body);
  if (!order) {
    return next({ statusCode: 404, message: "Order not found" });
  }
  res.json({ success: true, data: order });
};

export const deleteOrder = (req, res, next) => {
  const deleted = orderService.deleteOrder(Number(req.params.id));
  if (!deleted) {
    return next({ statusCode: 404, message: "Order not found" });
  }
  res.json({ success: true, message: "Order deleted" });
};
