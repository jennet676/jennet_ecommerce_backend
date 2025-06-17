import { Router } from 'express'
const router = Router()

import { getAllProducts, getAllProductsStatic } from '../controllers/products'

router.route('/').get(getAllProducts)
router.route('/static').get(getAllProductsStatic)

export default router