let words = []
let common = []
let firsts = {}
let ends = {}
let used = []
let last = []
let A = ''
let TIME = 5000
let t = TIME
let PAUSED = true
let SCORE = 0

const box = Id('words'),
    msg = Id('message'),
    input = Id('input'),
    bar = Id('bar'),
    splash = Id('splash'),
    replay = Id('replay'),
    score = Id('score'),
    first = Id('first'),
    options = Id('options'),
    fab = Id('fab')


// load text file
function readTextFile(file){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                let list = allText.split(`\n`)
                words = list.filter(w => (
                    w.length > 2 &&
                    !w.includes('-')) &&
                    !w.includes('(') &&
                    !w.includes('/')
                )
                for (let i = 0; i < words.length; i++){
                    let w = words[i]
                    let first = w.substring(0, 2)
                    let end = w.substring(w.length - 2)

                    if (firsts[first]) {
                        firsts[first].push(w)
                    } else {
                        firsts[first] = [w]
                    }

                    if (ends[end]) {
                        ends[end].push(w)
                    } else {
                        ends[end] = [w]
                    }
                }
            }
        }
    }
    rawFile.send(null);
}

// set commmon words
function readCommon(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                let list = allText.split(`\n`)
                common = list.filter(w => (
                    w.length > 2 &&
                    !w.includes('-')) &&
                    !w.includes('(') &&
                    !w.includes('/')
                )
            }
        }
    }
    rawFile.send(null);
}

// check if word is common
function com(w) {
    return common.includes(w)
}

// check if word is valid
function valid(end) {
    if (firsts[end] == undefined || firsts[end].length == 0 ) {
        return false
    }
    for (let i = 0; i < firsts[end].length; i++){
        let w = firsts[end][i]
        let new_end = w.substring(w.length - 2)

        if (firsts[new_end] != undefined && !used.includes(w)) {
            return true
        }
    }
    return false
}

// display message
function Message(m) {
    msg.innerHTML = m

    msg.style.top = '30px'

    setTimeout(() => {
        msg.style.top = '-50px'
    },3000)
}

// add word to list
function Add(w, user) {

    used.push(w)
    let str =
    `
    <div class = 'word user'>
        <h1> ${w}</h1>
    </div>
    `
    if (!user) {
        str =
        `
        <div class = 'word cpu'>
            <h1> ${w}</h1>
        </div>
        `
    }
    box.innerHTML += str
    box.scrollTo(0, box.scrollHeight)
}

// submit user word
function Submit(w) {
    if (!words.includes(w)) {
        Message('Not in word list')
        return
    }
    if (w.length < 3) {
        Message('Must be >= 3 letters')
        return
    }
    if (used.includes(w)) {
        Message("Can't repeat words")
        return
    }
    let first = w.substring(0, 2)
    let end = w.substring(w.length - 2)
    if (first != A) {
        Message('Must match prompt')
        return
    }
    if (!valid(end)) {
        Message('Invalid ending')
        return
    }
    // all good
    input.value = ''
    t = TIME
    PAUSED = true
    Add(w, true)
    SCORE += 1
    Reply(end)
}

// generate computer word
function Reply(end) {

    let options = firsts[end]
    options.sort(function (a, b) {
        return a.length - b.length;
    });

    let index = rand(options.length)
    let w = options[index]

    //console.log(options)
    //console.log(index)
    //console.log(w)

    let new_end = w.substring(w.length - 2)

    while (used.includes(w) || !valid(new_end)) {
        index = rand(options.length)
        w = options[index]
        new_end = w.substring(w.length - 2)
    }

    let first = w.substring(w.length - 2)

    setTimeout(() => {
        last.push(new_end)
        if (last.length > 6) {
            last.shift()
        }
        Add(w, false)
        A = first
        PAUSED = false
    },1000)
}

// start game
function init() {
    input.readOnly = 'false'

    let index = Math.round(Math.random() * words.length)
    let w = words[index]
    let end = w.substring(w.length - 2)

    while (!firsts[end] || firsts[end].length < 100 || end == 'es') {
        index = Math.round(Math.random() * words.length)
        w = words[index]
        end = w.substring(w.length - 2)
    }

    A = end

    //w = 'island'
    //A = 'ce'

    box.innerHTML =
        `
        <div class = 'word cpu' style = 'margin-top: auto;'>
            <h1 id = 'first'> ${w} </h1>
        </div>
        `
}

// generate random number
function rand(n) {
    return Math.round(Math.random()*(n-1))
}

// move common words to beginning
function sortByCommon(arr) {
    let j = 0
    for (let i = 0; i < arr.length; i++){
        if (com(arr[i])) {
            var temp = arr[j];
            arr[j] = arr[i]
            arr[i] = temp
            j++
        }
    }
}

// reset settings
function Reset() {
    t = TIME
    PAUSED = false
    SCORE = 0
    splash.style.top = '110vh'
    input.value = ''
    used = []
    init()
}

// end game
function End() {

    input.readOnly = 'true'
    score.innerHTML = SCORE
    splash.style.top = '0'

    let list = firsts[A]

    let opts = []
    list.sort(function(a, b){
        return a.length - b.length;
    });
    sortByCommon(list)
    let n = Math.min(list.length / 10 < 5 ? 5 : list.length / 10, list.length-1)
    let limit = Math.min(list.length, 5)

    let k = 0

    while (opts.length < limit && k < list.length-1) {
        let w = list[k]
        if (!com(w)) {
            let index = rand(n)
            w = list[index]
        }
        let end = w.substring(w.length-2)
        if (!opts.includes(w) && !used.includes(w) && valid(end) && w != undefined) {
            opts.push(w)
        }
        if (w == undefined) {
            break
        }
        k++
    }

    str = ``
    for (let i = 0; i < opts.length; i++){
        let opt = opts[i]
        str += `<h3 class = 'opt'> ${opt} </h3>`
    }
    options.innerHTML = str
}

function toggle() {
    Id('expo').classList.toggle('active')
}



// ACTION



readTextFile("corncob.txt");
readCommon("common.txt")
init()


fab.onclick = toggle
replay.onclick = Reset

window.addEventListener('keyup', e => {
    switch (e.key) {
        case 'Enter':
            if (splash.style.top != '0px') {
                Submit(Id('input').value.toLowerCase())
            }
            break
        case ' ':
            if (splash.style.top == '0px') {
                Reset()
            }
            break
        default:
            break
    }
})

// time
setInterval(() => {
    if (!PAUSED) {
        t -= 10
    }
    bar.style.width = Math.round(((t / TIME) * 100)) + '%'
    if (t < 0) {
        End()
        t = TIME
        PAUSED = true
    }
}, 10)


// loop
let loop = () => {

    window.requestAnimationFrame(loop)
}
window.requestAnimationFrame(loop)