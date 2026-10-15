import { CONTACT } from './data.js'
import { $, initShared } from './shared.js'
import { initMotion } from './motion.js'

$('#cPhone').textContent = CONTACT.phone; $('#cMail').textContent = CONTACT.email; $('#cAddr').textContent = CONTACT.address
$('#mailMain').href = `mailto:${CONTACT.email}`
initShared()
initMotion()
