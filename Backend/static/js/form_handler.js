import { crearItem } from './api_local.js'

document.getElementById('item-form').addEventListener('submit', async e => {
  e.preventDefault()
  const form = e.target
  const item = {
    title: form.title.value,
    description: form.description.value,
    image_url: form.image_url.value
  }
  await crearItem(item)
  alert('Item guardado correctamente')
  window.location.href = '/'
})
