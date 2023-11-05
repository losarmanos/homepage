

## Miembros
Esta sección es para mostrar información importante del miembro o prepu para usarse en caso de emergencia. Si hace falta contactar a alguien. Solo presiona el botón de emergencia y manda tu ubicación de GPS
<style>
  .miembro {display: none;}
  .miembro .row {display: flex}
  .miembro .picture {width: 340px; height: 340px; object-fit: cover;}
  .miembro .right {padding-left: 10px}
  .miembro .field {color: var(--danger)}
  .miembro .row {margin-top: 10px}
  .miembro .input {width: 100%; padding: 6px; border: none; margin-bottom: 2px}
  .miembro textarea {height: 100px; resize: none;}
  .miembro .submit {background-color: var(--danger)}
  .miembro .submit:hover {background-color: var(--darkDan)}
  .miembro .pictureHolder {text-align: center;}
  @media screen and (max-width: 699px) {
    .miembro {flex-direction: column;}
    .miembro .right {margin-top: 10px; padding: 0;}
  }
</style>
<div class="preview">Cargando información...</div>
<div class="miembro" id="miembro">
  <div class="pictureHolder">
    <img src="" class="picture" />
  </div>
  <div class="right">
    <span class="field">Nombre</span>
    <span class="name"></span><br/>
    <span class="field">Fecha de nacimiento</span>
    <span class="dob"></span><br/>
    <span class="field">Enfermedades o alergias</span>
    <span class="medicConditions"></span><br/>
    <span class="field">Tipo de sangre</span>
    <span class="bloodType"></span><br/>
    <span class="field">Vehículo(s)</span>
    <span class="vehicle"></span><br/>
    <span class="field">Seguro(s)</span>
    <span class="insurance"></span><br/>
    <div id="form">
      <div class="row">
        <input class="input" type="text" id="contactName" placeholder="Tu nombre"/>
        <input class="input" type="text" id="contactPhone" placeholder="Tu teléfono"/>
      </div>
      <textarea class="input" id="message" placeholder="Escribe aqui la emergencia"></textarea>
      <input class="input submit" id="submit" type="button" value="Notificar Emergencia" />
    </div>
  </div>
</div>
<script>
  const [, uid] = document.location.search.split('=')
  // const api = 'http://localhost:8081/members/'
  const api = 'https://api.losarmanos.com/members/'
  if (uid) {
    fetch(`${api}${uid}`).then(response => response.text())
      .then(data => {
        if (!data) return
        document.getElementById('miembro').style.display = 'flex'
        document.querySelector('.preview').style.display = 'none'
        const info = JSON.parse(data)
        const holder = document.getElementById('miembro')
        Object.entries(info).forEach(([key, value]) => {
          if (holder.querySelector(`.${key}`)) holder.querySelector(`.${key}`).innerText = value
        })
        holder.querySelector('.picture').src = info.picture
      })
      .catch(e => {
        console.error(e)
      })
    let location = { error: 'location not allowed' }
    navigator.geolocation.getCurrentPosition(
      ({coords}) => {
        location = {
          accuracy: coords.accuracy,
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      },
      (err) => { alert('Para poder mandar el reporte adecuadamente, por favor activa tu localización') },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
    document.getElementById('submit').addEventListener('click', () => {
      const author = document.getElementById('contactName').value
      const phone = document.getElementById('contactPhone').value
      const message = document.getElementById('message').value
      if ( !author || !phone || !message ) {
        alert('Tus datos son requeridos')
        return
      }
      document.getElementById('form').innerHTML = '<br/>Gracias por tu notificación, intentaremos localizar a su contacto de emergencia. Es posible que intentemos contactarnos contigo.'
      fetch(`${api}${uid}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          location,
          message: { author, phone, message }
        })
      })
    })
  }
</script>
