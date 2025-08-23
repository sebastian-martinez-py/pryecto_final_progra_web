export async function cargarAPIExterna() {
  const contenedor = document.getElementById('api-externa')
  const res = await fetch('https://dog.ceo/api/breeds/image/random/5')
  const data = await res.json()
  data.message.forEach(img => {
    const imgTag = document.createElement('img')
    imgTag.src = img
    contenedor.appendChild(imgTag)
  })
}
