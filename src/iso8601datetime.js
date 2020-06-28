function getIso8601z() {
  // timezone part
  let timezoneOffsetMin = new Date().getTimezoneOffset()
  let offsetHours = parseInt(Math.abs(timezoneOffsetMin / 60))
  let offsetMinutes = Math.abs(timezoneOffsetMin % 60)
  let timezoneStandard = null

  if(offsetHours < 10) {
    offsetHours = `0${offsetHours}`
  }

  if(offsetMinutes < 10) {
    offsetMinutes = `0${offsetMinutes}`
  }

  // Add an opposite sign to the offset
  // If offset is 0, it means timezone is UTC 
  if(timezoneOffsetMin < 0) {
    timezoneStandard = `+${offsetHours}:${offsetMinutes}`
  } else if(timezoneOffsetMin > 0) {
    timezoneStandard = `-${offsetHours}:${offsetMinutes}`
  } else if(timezoneOffsetMin == 0) {
    timezoneStandard = 'Z'
  }

  // date part
  const dt = new Date()
  let currentDate = dt.getDate()
  let currentMonth = dt.getMonth() + 1
  let currentYear = dt.getFullYear()
  let currentHours = dt.getHours()
  let currentMinutes = dt.getMinutes()
  let currentSeconds = dt.getSeconds()
  let currentDatetime = null

  // Add 0 before date, month, hrs, mins or secs if they are less than 0
  currentDate = currentDate < 10 ? `0${currentDate}` : currentDate;
  currentMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
  currentHours = currentHours < 10 ? `0${currentHours}` : currentHours;
  currentMinutes = currentMinutes < 10 ? `0${currentMinutes}` : currentMinutes;
  currentSeconds = currentSeconds < 10 ? `0${currentSeconds}` : currentSeconds;

  // Current datetime
  // String such as 2016-07-16T19:20:30
  currentDatetime = `${currentYear}-${currentMonth}-${currentDate}T${currentHours}:${currentMinutes}:${currentSeconds}`

  return `${currentDatetime}${timezoneStandard}`
}

module.exports = getIso8601z