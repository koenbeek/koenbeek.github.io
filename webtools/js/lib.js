function gE(id) { return document.getElementById(id) } // get an Element by ID
function gV(id) { return gE(id).value } // get an Element value by ID
function gC(id) { return gE(id).checked } // get checked status of a checkbox by ID
function fromCP() { navigator.clipboard.readText().then((t) => { gE("intext").value = t; window.run() }); } // read clipboard and use kit for intext textarea content
function toCP() { navigator.clipboard.writeText(gV("outtext")) } // copy outtext textarea content to clipboard
function setErr(id, e) { gE(id).style.borderColor = "red"; gE(id).style.color = "red"; if (e) gE("outtext").value = e.message } // set an element as in error
function setOK(id) { gE(id).style.borderColor = "inherit"; gE(id).style.color = "inherit"; } // set an element as OK
function sErr(ids, e) { if (Array.isArray(ids)) { ids.forEach(id => setErr(id, e)) } else { setErr(ids, e) } } // set elements as in error
function sOK(ids) { if (Array.isArray(ids)) { ids.forEach(id => setOK(id)) } else { setOK(ids) } } // set elements as OK
function r(N) { return Math.floor(Math.random() * N) } // get a random integer nbr between 0 and N not included
function ran(N) { // get a random el from an Array, char from a string or a number between 0 and N not included
    if (Array.isArray(N)) { return N[r(N.length)] }
    else if (typeof N === 'string') { return N.charAt(r(N.length)) }
    else { return r(N) }
}
function ranTxt(len, pool) { var r = '', i = 0; for (; i < len; i++) { r += ran(pool); }; return r } // create random string of length len based on chars in pool 
function ranNum(len) { var n = ranTxt(len, '0123456789'); return len < 16 ? parseInt(n) : BigInt(n) } // create random number of length len
function createEl(typ, attrs) { var el = document.createElement(typ); Object.assign(el, attrs); return el } // create a html document element
function addChild(typ, attrs, id) { gE(id).appendChild(createEl(typ, attrs)) } // add a child element to an existing html document element
function doDL() { createEl("a", { href: "data:x-application/text," + escape(gV("outtext")), download: 'output.txt' }).click() } // download outtext as file
function addArEl(pid, i, txt, siz) { let id = pid + i; addChild("div", { id: "div" + id, innerHTML: '<label for="' + id + '">' + txt + i + ':&nbsp;</label><input type="text" id="' + id + '" size=' + siz + ' oninput="run()"><br>' }, pid + "s") }
function mngAr(id, nbr, min, txt, siz) {
    while ((nbr > min) && ((gV(id + nbr) == "") && (gV(id + (nbr - 1)) == ""))) { gE(id + "s").removeChild(gE("div" + id + nbr--)) }
    if (gV(id + nbr) != '') { addArEl(id, ++nbr, txt, siz) }
    return nbr
}
async function doSetup(f, out, inp, ar = []) { // set up the webpage
    let ret = []
    Object.assign(window, { run: f, toCP: toCP, fromCP: fromCP, doDL: doDL, gE: gE }) // make sure document sees the functions
    if (inp) { // create the intext text area and related heading and buttons
        document.body.appendChild(createEl("div", {
            innerHTML: "<h2>Input " +
                "<button onclick='fromCP()'>Get From Clipboard</button>" +
                "<button onclick='gE(\"" + "infile" + "\").click()'>Upload File</button>" +
                "<input type='file' style='display:none;' id='infile'/></h2>" +
                "<textarea id='intext' rows='" + inp[0] + "' cols='" + inp[1] + "'></textarea>"
        }))
        gE("infile").addEventListener("change", function (e) { // add upload file to intext functionality
            var r = new FileReader()
            r.onload = e => { gE('intext').value = e.target.result; f() }
            r.readAsText(gE("infile").files[0])
        }, false)
    }
    if (out) { // create the outtext text area and related heading and buttons
        document.body.appendChild(createEl("div", {
            innerHTML: "<h2>Output " +
                "<button onclick='toCP()'>Copy To Clipboard</button>" +
                "<button onclick='doDL()'>Download</button></h2>" +
                "<textarea id='outtext' rows='" + out[0] + "' cols='" + out[1] + "' readonly></textarea>"
        }))
    }
    const p = new URLSearchParams(document.location.search); // capture URL parameters and apply them to the relevant elements
    if (p.has("paramfile")) { // get parameters from a parameter file in JSON format
        const r = await fetch(p.get("paramfile")), params = await r.json()
        Object.keys(params).forEach(k => p.append(k, params[k]))
    }
    ar.forEach(a => { // handle arrayed input texts - a is like { id: "xp", txt: "XPath ", siz: "40", min: nbrxp }
        for (var npar = 1; p.has(a.id + (npar++));); // find highest input parameter for this input
        a.min = Math.max(a.min, npar - 1) // combbine min nbr with nbr from input params
        ret.push(a.min) // return value to caller
        for (let i = 1; i <= a.min; i++) { addArEl(a.id, i, a.txt, a.siz) }
    });
    ["input[type = 'text']", "#intext", "input[type='checkbox']", "select"].forEach(q => {
        document.querySelectorAll(q).forEach(e => {
            if (p.has(e.id)) { e.type === 'checkbox' ? e.checked = (p.get(e.id) == "on") : e.value = p.get(e.id) }
            gE(e.id).addEventListener("input", f) // run run when content changes
        })
    })
    return ret
}
export { gE, gV, gC, doSetup, sErr, sOK, ran, ranTxt, ranNum, addChild, mngAr }