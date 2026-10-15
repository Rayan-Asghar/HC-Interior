import { COLLECTIONS } from './data.js'
import { $, watchCanvases, initShared } from './shared.js'
import { renderRows } from './rows.js'
import { initMotion } from './motion.js'

renderRows($('#collRows'), COLLECTIONS)
watchCanvases()
initShared()
initMotion()
