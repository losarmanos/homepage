

<div class="head" markdown="1">

  # !{siteName} Querétaro
</div>

## Próximas rodadas
<style>
  .holder {display: flex; align-items: center;}
  .rodadas {list-style: none; padding-top: 10px;}
  .rodadas .event {padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px dashed var(--darkCon)}
  .detts {display: flex; flex-direction: column; margin-left: 20px;}
  .nombre {font-size: 150%; color: var(--success);}
  .timeText {color: var(--danger)}
  .cal {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 10px;
    width: 65px;
    height: 65px;
    overflow: hidden;
    justify-content: space-between;
  }
  .cal .month, .cal .day {
    background-color: var(--darkPri);
    width: 100%;
    text-align: center;
    font-size: 60%;
    padding: 2px 0;
  }
  .cal .date {
    color: var(--background);
    background-color: var(--contrast);
    width: 100%;
    flex-grow: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 120%;
  }
  .cal .day {
    background-color: var(--darkSuc);
  }
  .lugar { font-size: 80%;}
  .description { font-size: 80%; color: var(--lightPri);}
</style>
<div style="display: none;">
  <div id="template" class="event">
    <div class="holder">
      <div>
        <div class="cal">
          <div class="month"></div>
          <div class="date"></div>
          <div class="day"></div>
        </div>
      </div>
      <div class="detts">
        <div class="nombre"></div>
        <div>
          <span class="inicio"></span>
          <span class="fin"></span>
        </div>
        <div class="lugar"></div>
        <div class="description"></div>
      </div>
    </div>
  </div>
</div>
<div id="rodadas" class="rodadas">Esto está muy vacío :(</div>

<script>
  const addZ = i => `00${i}`.slice(-2)
  const getDate = (timestamp, isFullDay) => {
    const d = new Date(timestamp)
    return `${d.getFullYear()}/${addZ(d.getMonth() + 1)}/${addZ(d.getDate())}`
  }
  const getTime = (timestamp, isInit, isFullDay) => {
    if (isFullDay) {
      if (isInit) return ''
      return `<span class="timetext">Todo el dia hasta el: </span>${getDate(timestamp, isFullDay)}`
    }
    const d = new Date(timestamp)
    const str = isInit ? 'Desde: ' : 'Hasta: '
    return `<span class="timetext">${str}</span>${addZ(d.getHours())}:${addZ(d.getMinutes())} hrs `
  }
  const processTime = timestamp => {
    const year = parseInt(timestamp.slice(0, 4))
    const month = parseInt(timestamp.slice(4, 6)) - 1
    const day = parseInt(timestamp.slice(6, 8))
    if (timestamp.length === 8) {
      return new Date(Date.UTC(year, month, day)).getTime()
    }
    const hour = parseInt(timestamp.slice(9, 11))
    const minute = parseInt(timestamp.slice(11, 13))
    const second = parseInt(timestamp.slice(13, 15))
    return new Date(Date.UTC(year, month, day, hour, minute, second)).getTime()
  }
  fetch('http://localhost:8081/queretaro').then(response => response.text())
  .then(data => {
    const rodadas = JSON.parse(data)
    if (rodadas.length === 0) return
    const target = document.getElementById('rodadas')
    target.innerHTML = ''
    const template = document.getElementById('template').cloneNode(true)
    template.removeAttribute("id")
    rodadas.forEach(event => {
      const item = template.cloneNode(true)
      event.start = processTime(event.start)
      event.end = processTime(event.end)
      if (event.isFullDay) {
        const d = new Date(event.start)
        d.setDate(d.getDate() + 1)
        event.start = d.getTime()
      }
      item.querySelector('.month').innerText = new Date(event.start).toLocaleDateString(undefined, { month: 'long' })
      item.querySelector('.date').innerText = new Date(event.start).getDate()
      item.querySelector('.day').innerText = new Date(event.start).toLocaleDateString(undefined, { weekday: 'long' })
      item.querySelector('.nombre').innerText = event.name
      item.querySelector('.inicio').innerHTML = getTime(event.start, true, event.isFullDay)
      item.querySelector('.fin').innerHTML = getTime(event.end, false, event.isFullDay)
      if (event.location) item.querySelector('.lugar').innerText = `📍 ${event.location}`
      if (event.description) item.querySelector('.description').innerText = event.description
      target.appendChild(item)
    })
  })
  .catch(error => {
    console.error(error)
  })
</script>
