import { Router } from "express";
import * as orderController from "../controllers/orderController.js";

const router = Router();

router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrder);
router.post("/", orderController.createOrder);
router.put("/:id", orderController.updateOrder);
router.delete("/:id", orderController.deleteOrder);

export default router;
