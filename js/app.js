const data = {
  FIVE_STAR_BASE: .006,
  FOUR_STAR_BASE: .051,
  SIM_COUNTER_LIMIT: 10000
}

const ERROR_LOG = []

const RUN_BUTTON = document.getElementById('RunBTN')
const RESET_BUTTON = document.getElementById('ResetBTN')

RUN_BUTTON.addEventListener('click', () => { LoadAndRunSim() })
RESET_BUTTON.addEventListener('click', () => { resetWinsData() })

function LoadAndRunSim() {
  LoadDatafromHTML()
  if (!data.hasOwnProperty('wins')) {
    resetWinsData()
  }
  if (!data.hasOwnProperty('winsArray')) {
    allocateWinsArray()
  }
  let count = 0
  let simCount = 0
  do {
    ++simCount
    while (count < data.wishes) {
      ++count
      // Get Award
      data.award = getAward(count)
      // Analyze Award
      if (data.award.fiveStarWin) {
        data.wins.five++
        if (data.wins.five > data.desired5) {
          console.log(`Sim Round ${simCount}: 5* Wins exceeds limit (${data.wins.five}/${data.desired5}) on wish ${count}.`)
          data.wins.five = 0
          break
        }
        console.log(`Received 5* Award on wish ${data.award.wish}/${data.wishes}\n`)
      }
      if (data.award.fourStarWin) {
        // debug data
        if (!data.hasOwnProperty('debug')) data.debug = []
        data.debug.push({wish: data.award.wish, gty:data.gtyRateup4})
        // end debug data
        if (data.award.wonDesired4) {
          data.wins.desiredLevel4++
        } else {
          data.wins.otherFour++
        }
        // console.log(`Received ${(data.award.wonDesired4 ? 'desired' : 'other')} 4* Award on wish ${data.award.wish}.\n`)
        if (data.wins.desiredLevel4 == data.desired4) {
          if(count == 1) ERROR_LOG.PUSH(`COUNT ERROR ${count}`)
          data.winsArray[count - 1]++
          console.log(`Sim Round ${simCount}: Won ${data.desired4} desired level 4 awards by wish ${count} / ${data.wishes}`)
          data.wins.desiredLevel4 = 0
          break
        }
      }
    } // end round
    count = 0
    data.wins.desiredLevel4 = 0
  } while (simCount < data.SIM_COUNTER_LIMIT)

  calcAndDisplayWinsPercentage()
  // logData()
}

function getAward(_wish) {
  let modifiers = getModifiers()
  let awardLVL5 = data.FIVE_STAR_BASE + (10 * data.FIVE_STAR_BASE * modifiers.pm5)
  let awardLVL4 = data.FOUR_STAR_BASE + (10 * data.FOUR_STAR_BASE * modifiers.pm4)
  let rand5 = Math.random()
  let rand4 = Math.random()
  let award = { wish: _wish, fourStarWin: 0, rateup4: 0, wonDesired4: 0, fiveStarWin: 0, rateup5: 0 }

  if (awardLVL5 > rand5) {
    // TODO: Check rate-up guarantee
    award.fiveStarWin++
    // award.rateup5 = (Math.random() < (1 / 2) ? 1 : 0)
    data.pity5 = 0
    data.pity4++
    return award
  } else if (awardLVL4 > rand4) {
    award.fourStarWin++
    // Check rate-up guarantee
    if (data.gtyRateup4) {
      award.wonDesired4 = (Math.random() < (1 / 3) ? 1 : 0)
      data.gtyRateup4 = 0 // move to setter function?
    } else {
      // ROLL 50/50 ON SUCCESS GET desired else GET other and set guarantee
      if (Math.random() < (1 / 2) ? 1 : 0) {
        award.wonDesired4 = (Math.random() < (1 / 3) ? 1 : 0)
        data.gtyRateup4 = 0 // move to setter function?
      } else {
        // Got non-promo level 4 award, set level 4 rate up guarantee
        data.gtyRateup4 = 1 // move to setter function
      }
    }
    data.pity4 = 0
    data.pity5++
    return award
  } else {
    data.pity4++
    data.pity5++
    return award
  }
}

function getModifiers() {
  let modifier4 = Math.max(0, data.pity4 - 7)
  let modifier5 = Math.max(0, data.pity5 - 72)

  return {
    pm4: modifier4,
    pm5: modifier5
  }
}

function LoadDatafromHTML() {
  data.wishes = Number(document.getElementById('wishes').innerText)
  data.pity4 = Number(document.getElementById('pity4').innerText)
  data.desired4 = Number(document.getElementById('desired4').innerText)
  data.gtyRateup4 = Number(document.getElementById('guarantee4').innerText)
  data.pity5 = Number(document.getElementById('pity5').innerText)
  data.desired5 = Number(document.getElementById('desired5').innerText)
  data.gtyRateup5 = Number(document.getElementById('guarantee5').innerText)
  data.modifiers = getModifiers()
}

function resetWinsData() {
  data.wins = { desiredLevel5: 0, desiredLevel4: 0, otherFour: 0, five: 0 }
}

function allocateWinsArray() {
  if (data.hasOwnProperty('wishes')) {
    data.winsArray = new Array(data.wishes)
    data.winsArray.fill(0)
  }

}

function logData() {
  console.log(data)
}

function calcAndDisplayWinsPercentage() {
  let sum = 0
  data.winsArray.forEach((val) => { sum += val })
  console.log(`${sum}/${data.SIM_COUNTER_LIMIT} : ${((sum / data.SIM_COUNTER_LIMIT) * 100).toFixed(1)}%`)
  if(ERROR_LOG.length) console.log(`${ERROR_LOG}`)
}