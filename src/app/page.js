import moment from 'moment';

export default async function Home() {

  const cal_id = '98a30a37d1a3e1909c7a4db5b91430c7494ef2dab8673929aa80f2305edffe13@group.calendar.google.com';


  const current_date_time = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  const maanden = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  const dagen = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

  Date.prototype.getFullMinutes = function () {
    if (this.getMinutes() < 10) {
      return '0' + this.getMinutes();
    }
    return this.getMinutes();
  };

  Date.prototype.getFullHours = function () {
    if (this.getHours() < 10) {
      return '0' + this.getHours();
    }
    return this.getHours();
  };

  const apikey = process.env.NEXT_PUBLIC_API_KEY;

  const params = new URLSearchParams();
  params.append("key", `${apikey}`);
  params.append("singleEvents", "True");
  params.append("orderBy", "startTime");
  params.append("timeMin", `${current_date_time}`);

  const calendar_urls = [
    '969ec74f52b7007ab3cfaf306e807939f0da397f543ed311a9bc4cb115710516@group.calendar.google.com',
    '98a30a37d1a3e1909c7a4db5b91430c7494ef2dab8673929aa80f2305edffe13@group.calendar.google.com',
    '42245e5ec6cbfa0a3edfebafe6f7ba69e6a34b319712db1499a1374172691a0a@group.calendar.google.com'
  ];

  const urls = calendar_urls.map(url =>
    `https://www.googleapis.com/calendar/v3/calendars/${url}/events?${params}`
  )

  var events = new Array();
  await callApis(urls)
    .then(calendars =>
      calendars.forEach(calendar =>
        calendar.items.forEach(item =>
          events.push({ 'calendarname': calendar.summary, 'item': item })
        )
      )
    );

  events.sort(function (a, b) {
    return Date.parse(a.item.start.date != null ? a.item.start.date : a.item.start.dateTime) - Date.parse(b.item.start.date != null ? b.item.start.date : b.item.start.dateTime);
  })

  const getDescriptionValues = (text) => {
    const regex = /\[([^\][]*)]/g;
    const matches = String(text).match(regex);
    const result = new Array();
    if (matches) {
      for (let i = 0; i < matches.length; ++i) {
        const match = matches[i];
        const withoutBrackets = match.substring(1, match.length - 1); // brackets removing
        const splitted = withoutBrackets.split('#');
        result.push({ 'key': splitted[0], 'value': splitted[1] });
      }
    }
    return result;
  };

  return (
    <div>
      {events.map((event) => {
        const fullDayEvent = event.item.start.date != null && event.item.end.date != null;
        const startDatum = fullDayEvent ? new Date(event.item.start.date) : new Date(event.item.start.dateTime);
        const eindDatum = fullDayEvent ? new Date(event.item.end.date) : new Date(event.item.end.dateTime);
        const descriptionValues = getDescriptionValues(event.item.description);
        const url = getValueByKey(descriptionValues, 'url');
        const text = getValueByKey(descriptionValues, 'text');
        return (
          <div key={event.item.id} className="events-wrapper">
            <div className="events-container">
              <div>
                <div className="events-date">
                  <p className="event-weekdag">{dagen[startDatum.getDay()]}</p>
                  <p className="event-maand">{maanden[startDatum.getMonth()]}</p>
                  <p className="event-dag">{startDatum.getDate()}</p>
                </div>
              </div>
              <div className="events-body">
                <div className="events-header">
                  {url != undefined ? <p><a href={url}>{event.item.summary.toUpperCase()}</a></p> : <p>{event.item.summary.toUpperCase()}</p>}
                </div>
                <div className="events-location small">
                  <p>{event.item.location}</p>
                </div>
                <div className="events-duration bold italic">
                  {fullDayEvent ? <p>De hele dag</p> : <p>{startDatum.getFullHours()}:{startDatum.getFullMinutes()} - {eindDatum.getFullHours()}:{eindDatum.getFullMinutes()} uur</p>}
                </div>
                <div>
                  <p>{text}</p>
                </div>
                <div className="events-location small">
                  <p>{event.calendarname}</p>
                </div>
              </div>
            </div>
          </div>
        );
      }
      )}
    </div>
  )

  async function callApis(urls) {
    const response = await Promise.all(urls.map(u => fetch(u)));
    const data = await Promise.all(response.map(r => r.json()));
    console.log(data)
    return data === undefined ? '' : data;
  }

  function getValueByKey(arr, key) {
    for (var i = 0, iLen = arr.length; i < iLen; i++) {
      if (arr[i].key == key) return arr[i].value;

    }
  }
}